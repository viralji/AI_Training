import express from 'express';
import { assignmentDB, submissionDB } from '../db/database.js';
import { authenticateToken, requireTrainer } from '../middleware/auth.js';
import { socketEvents } from '../services/socket.js';

const router = express.Router();

// Get all assignments
router.get('/', authenticateToken, async (req, res) => {
    try {
        const assignments = assignmentDB.getAll();
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get assignment by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const assignment = assignmentDB.getById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start an assignment by slide_id (Trainer only)
router.post('/:slideId/start', authenticateToken, requireTrainer, async (req, res) => {
    try {
        const { slideId } = req.params;
        
        // Check if assignment exists
        const assignment = assignmentDB.getBySlideId(slideId);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        
        // Check if already active
        if (assignment.status === 'active') {
            return res.status(400).json({ error: 'Assignment already started' });
        }
        
        // Update assignment status
        assignmentDB.updateStatusBySlideId(slideId, 'active');
        
        // Emit socket event
        socketEvents.emitAssignmentStarted(slideId);
        
        res.json({ message: 'Assignment started', slideId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start an assignment by database ID (Trainer only) - DEPRECATED
router.post('/:id/start', authenticateToken, requireTrainer, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get assignment by ID to find slideId
        const assignment = assignmentDB.getById(id);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        
        // Update assignment status
        assignmentDB.updateStatus(id, 'active');
        
        // Emit socket event with slideId
        socketEvents.emitAssignmentStarted(assignment.slide_id);
        
        res.json({ message: 'Assignment started', slideId: assignment.slide_id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// End an assignment (Trainer only)
router.post('/:id/end', authenticateToken, requireTrainer, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Update assignment status
        assignmentDB.updateStatus(id, 'completed');
        
        // Emit socket event
        socketEvents.emitAssignmentEnded(id);
        
        res.json({ message: 'Assignment ended', assignmentId: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get active assignments
router.get('/status/active', authenticateToken, async (req, res) => {
    try {
        const active = assignmentDB.getActive();
        res.json(active);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset an assignment - delete all submissions and reset status (Trainer only)
router.post('/:slideId/reset', authenticateToken, requireTrainer, async (req, res) => {
    try {
        const { slideId } = req.params;
        
        // Check if assignment exists
        const assignment = assignmentDB.getBySlideId(slideId);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        
        // Delete all submissions for this assignment
        const deletedCount = submissionDB.deleteByAssignment(assignment.id);
        
        // Reset assignment status to hidden
        assignmentDB.updateStatusBySlideId(slideId, 'hidden');
        
        // Emit socket event to notify clients
        socketEvents.emitAssignmentReset(slideId);
        
        res.json({ 
            message: 'Assignment reset successfully', 
            slideId,
            deletedSubmissions: deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

