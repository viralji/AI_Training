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
    const { slideId } = req.params;
    const userId = req.user?.id || 'unknown';
    
    try {
        console.log(`[Assignment Start] Attempting to start assignment: ${slideId} by user: ${userId}`);
        
        // Check if assignment exists
        const assignment = assignmentDB.getBySlideId(slideId);
        if (!assignment) {
            const errorMsg = `Assignment not found: ${slideId}`;
            console.error(`[Assignment Start Error] ${errorMsg}`);
            return res.status(404).json({ 
                error: errorMsg,
                slideId: slideId,
                timestamp: new Date().toISOString(),
                code: 'ASSIGNMENT_NOT_FOUND'
            });
        }
        
        console.log(`[Assignment Start] Found assignment: ${assignment.id}, current status: ${assignment.status}`);
        
        // Check if already active
        if (assignment.status === 'active') {
            const errorMsg = `Assignment ${slideId} is already active`;
            console.warn(`[Assignment Start Warning] ${errorMsg}`);
            return res.status(400).json({ 
                error: errorMsg,
                slideId: slideId,
                assignmentId: assignment.id,
                currentStatus: assignment.status,
                timestamp: new Date().toISOString(),
                code: 'ASSIGNMENT_ALREADY_ACTIVE'
            });
        }
        
        // Update assignment status
        try {
            assignmentDB.updateStatusBySlideId(slideId, 'active');
            console.log(`[Assignment Start] Status updated to active for: ${slideId}`);
        } catch (dbError) {
            const errorMsg = `Database error updating assignment status: ${dbError.message}`;
            console.error(`[Assignment Start Error] ${errorMsg}`, dbError);
            return res.status(500).json({ 
                error: errorMsg,
                slideId: slideId,
                databaseError: dbError.message,
                timestamp: new Date().toISOString(),
                code: 'DATABASE_UPDATE_ERROR'
            });
        }
        
        // Emit socket event
        try {
            socketEvents.emitAssignmentStarted(slideId);
            console.log(`[Assignment Start] Socket event emitted for: ${slideId}`);
        } catch (socketError) {
            const errorMsg = `Socket error emitting assignment started: ${socketError.message}`;
            console.error(`[Assignment Start Error] ${errorMsg}`, socketError);
            // Don't fail the request if socket fails, but log it
        }
        
        console.log(`[Assignment Start] Successfully started assignment: ${slideId}`);
        res.json({ 
            message: 'Assignment started successfully', 
            slideId: slideId,
            assignmentId: assignment.id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        const errorMsg = `Unexpected error starting assignment ${slideId}: ${error.message}`;
        console.error(`[Assignment Start Error] ${errorMsg}`, error);
        console.error(`[Assignment Start Error] Stack trace:`, error.stack);
        res.status(500).json({ 
            error: errorMsg,
            slideId: slideId,
            errorType: error.constructor?.name || 'Unknown',
            errorMessage: error.message,
            timestamp: new Date().toISOString(),
            code: 'INTERNAL_SERVER_ERROR'
        });
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

