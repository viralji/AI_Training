import express from 'express';
import { submissionDB, assignmentDB } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { socketEvents } from '../services/socket.js';
import scoringQueue from '../services/scoringQueue.js';

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

        // Prepare submission data
        const submissionData = {
            assignment_id: assignment.id, // Use database ID, not slide ID
            user_id,
            content,
            submission_time
        };

        // Create submission (handles race conditions with INSERT OR IGNORE)
        // Returns null if duplicate submission detected
        const submissionId = submissionDB.create(submissionData);
        
        // Handle race condition: if submissionId is null, it means duplicate was detected
        if (submissionId === null) {
            // Check if submission exists (might have been created by another request)
            const existing = submissionDB.getByAssignmentAndUser(assignment.id, user_id);
            if (existing) {
                return res.status(400).json({ 
                    error: 'Already submitted',
                    submissionId: existing.id,
                    submission: existing
                });
            } else {
                // Race condition edge case - should not happen, but handle gracefully
                return res.status(409).json({ 
                    error: 'Submission conflict - please try again',
                    code: 'SUBMISSION_CONFLICT'
                });
            }
        }

        // Get the created submission
        const submission = submissionDB.getByAssignmentAndUser(assignment.id, user_id);
        if (!submission) {
            console.error(`[Submission] Created submission ${submissionId} but could not retrieve it`);
            return res.status(500).json({ error: 'Failed to retrieve submission after creation' });
        }

        // Add submission to scoring queue (non-blocking, with retry mechanism)
        // The queue handles rate limiting and retries automatically
        console.log(`[Submission] Adding submission ${submissionId} to scoring queue (assignment: ${assignment.id}, slide: ${assignment.slide_id})`);
        try {
            const queueResult = scoringQueue.addToQueue(
                submissionId,
                content,
                assignment.id,
                assignment.slide_id,
                user_id,
                0 // Initial attempt (not a retry)
            );
            if (queueResult && typeof queueResult.catch === 'function') {
                queueResult.catch((error) => {
                    console.error(`[Submission] Failed to process submission ${submissionId} in queue:`, error);
                });
            }
            console.log(`[Submission] Submission ${submissionId} added to queue successfully`);
        } catch (error) {
            console.error(`[Submission] Failed to add submission ${submissionId} to queue:`, error);
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

// Get scoring queue statistics (for monitoring - Trainer only)
router.get('/queue/stats', authenticateToken, async (req, res) => {
    try {
        // Check if user is trainer
        if (req.user.role !== 'trainer') {
            return res.status(403).json({ error: 'Trainer access required' });
        }

        const stats = scoringQueue.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

