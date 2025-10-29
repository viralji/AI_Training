import express from 'express';
import { submissionDB, assignmentDB } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { socketEvents } from '../services/socket.js';
import geminiService from '../services/gemini.js';

const router = express.Router();

// Submit assignment (text-only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { assignment_id, content, submission_time } = req.body;
        const user_id = req.user.id;

        if (!assignment_id || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if assignment is active
        const assignment = assignmentDB.getBySlideId(assignment_id);
        if (!assignment || assignment.status !== 'active') {
            return res.status(400).json({ error: 'Assignment is not active' });
        }

        // Check if already submitted
        const existing = submissionDB.getByAssignmentAndUser(assignment.id, user_id);
        if (existing) {
            return res.status(400).json({ error: 'Already submitted' });
        }

        // Prepare submission data
        const submissionData = {
            assignment_id: assignment.id, // Use database ID, not slide ID
            user_id,
            content,
            submission_time
        };

        // Create submission
        const submissionId = submissionDB.create(submissionData);
        const submission = submissionDB.getByAssignmentAndUser(assignment.id, user_id);

        // Auto-score with Gemini AI (async, non-blocking) - LIVE SCORING
        if (geminiService.isAvailable()) {
            console.log(`[Submission] Starting live auto-scoring for submission ${submissionId} (Assignment: ${assignment.title})`);
            
            // Extract requirements from description/instruction HTML
            // Check both 'instruction' and 'description' fields for maximum compatibility
            const instructionHtml = assignment.instruction || assignment.description || '';
            let requirements = [];
            
            if (instructionHtml) {
                // Try to extract requirements from HTML list items
                const requirementMatch = instructionHtml.match(/<li>(.+?)<\/li>/g);
                if (requirementMatch) {
                    requirements = requirementMatch.map(li => li.replace(/<\/?li>/g, '').replace(/<[^>]*>/g, '').trim());
                }
                
                // If no list items found, try to extract from "Your Task:" or "Requirements:" sections
                if (requirements.length === 0) {
                    const taskMatch = instructionHtml.match(/(?:Your Task|Requirements?|Task|Assignment):\s*(.+?)(?=<h|<div|$)/is);
                    if (taskMatch) {
                        const taskText = taskMatch[1].replace(/<[^>]*>/g, ' ').trim();
                        if (taskText) {
                            requirements.push(taskText);
                        }
                    }
                }
                
                // Extract evaluation criteria if present
                const criteriaMatch = instructionHtml.match(/(?:evaluate|evaluation|scoring|criteria).*?<li>(.+?)<\/li>/gis);
                if (criteriaMatch) {
                    criteriaMatch.forEach(match => {
                        const criterion = match.replace(/<\/?li>/g, '').replace(/<[^>]*>/g, '').trim();
                        if (criterion) {
                            requirements.push(`Evaluation: ${criterion}`);
                        }
                    });
                }
            }

            console.log(`[Submission] Scoring with ${requirements.length} extracted requirements`);

            geminiService.scoreAssignment(
                content, 
                assignment.title || assignment.name || 'Assignment',
                instructionHtml, // Pass full HTML description/instruction
                requirements
            )
                .then(async (scoringResult) => {
                    console.log(`[Submission] ✅ Scoring complete for submission ${submissionId}: ${scoringResult.score}/10`);
                    
                    // Update submission with AI score
                    submissionDB.updateScore(submissionId, scoringResult.score, scoringResult.feedback);
                    
                    // Get updated submission with all details
                    const updatedSubmission = submissionDB.getByAssignmentAndUser(assignment.id, user_id);
                    
                    if (updatedSubmission) {
                        // Add slideId for frontend compatibility
                        updatedSubmission.slideId = assignment.slide_id;
                        
                        // Emit socket event with score (LIVE UPDATE)
                        socketEvents.emitSubmissionScored(updatedSubmission);
                        console.log(`[Submission] 📡 Emitted submission:scored event for trainer dashboard`);
                    } else {
                        console.warn(`[Submission] ⚠️ Could not find updated submission ${submissionId} to emit`);
                    }
                })
                .catch((error) => {
                    console.error(`[Submission] ❌ Auto-scoring failed for submission ${submissionId}:`, error.message);
                    console.error(`[Submission] Error stack:`, error.stack);
                    // Don't fail the submission if scoring fails - submission is still saved
                });
        } else {
            console.warn('[Submission] ⚠️ Gemini AI not available - skipping auto-scoring');
        }

        // Emit socket event for trainer (immediate, without score)
        socketEvents.emitSubmissionReceived(submission);

        res.json({ 
            message: 'Submission received', 
            submissionId,
            submission 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get submissions for an assignment (Trainer only)
router.get('/assignment/:assignmentId', authenticateToken, async (req, res) => {
    try {
        const { assignmentId } = req.params;
        
        // Check if assignmentId is a slide ID (starts with 'slide-') or database ID
        let assignment;
        if (assignmentId.startsWith('slide-')) {
            assignment = assignmentDB.getBySlideId(assignmentId);
        } else {
            assignment = assignmentDB.getById(assignmentId);
        }
        
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        
        const submissions = submissionDB.getByAssignment(assignment.id);
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get my submissions
router.get('/my-submissions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const allSubmissions = submissionDB.getAll();
        const mySubmissions = allSubmissions.filter(s => s.user_id === userId);
        res.json(mySubmissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Score submissions (Trainer only - but we'll check role in route)
router.post('/score/:assignmentId', authenticateToken, async (req, res) => {
    try {
        // Check if user is trainer
        if (req.user.role !== 'trainer') {
            return res.status(403).json({ error: 'Trainer access required' });
        }

        const { assignmentId } = req.params;
        
        // Get assignment
        const assignment = assignmentDB.getById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Parse rubric
        let rubric = {};
        try {
            rubric = JSON.parse(assignment.rubric);
        } catch {
            // Default rubric
            rubric = {
                completeness: { weight: 40, description: 'All parts of the task are addressed' },
                quality: { weight: 40, description: 'Content is thoughtful and relevant' },
                clarity: { weight: 20, description: 'Writing is clear and well-structured' }
            };
        }

        // Get all submissions
        const submissions = submissionDB.getByAssignment(assignmentId);

        // Score each submission
        const results = await geminiService.scoreMultiple(submissions, assignment, rubric);

        // Update scores in database
        results.forEach(result => {
            submissionDB.updateScore(result.submissionId, result.score, result.feedback);
        });

        // Emit socket event
        socketEvents.emitScoringComplete(assignmentId, results);

        // Get updated submissions with scores
        const updatedSubmissions = submissionDB.getByAssignment(assignmentId);

        // Generate leaderboard
        const leaderboard = updatedSubmissions
            .filter(s => s.is_graded)
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.submission_time - b.submission_time;
            });

        socketEvents.emitLeaderboardUpdate(assignmentId, leaderboard);

        res.json({
            message: 'Scoring complete',
            results,
            leaderboard
        });
    } catch (error) {
        console.error('Scoring error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get leaderboard for an assignment
router.get('/leaderboard/:assignmentId', authenticateToken, async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = submissionDB.getByAssignment(assignmentId);
        
        // Sort by score (if graded) or submission time
        const leaderboard = submissions
            .filter(s => s.is_graded)
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.submission_time - b.submission_time;
            });

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

