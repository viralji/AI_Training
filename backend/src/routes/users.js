import express from 'express';
import { userDB } from '../db/database.js';
import { authenticateToken, requireTrainer } from '../middleware/auth.js';

const router = express.Router();

/**
 * Check user approval status (for trainees)
 * GET /api/users/check-status
 */
router.get('/check-status', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        const userRole = req.user.role;
        
        // Trainers are always approved - return immediately
        if (userRole === 'trainer') {
            return res.json({
                approved: true,
                enabled: true,
                role: 'trainer'
            });
        }
        
        // Match by email first (more reliable), then fallback to ID
        let user = userDB.findByEmail(userEmail);
        if (!user) {
            user = userDB.getById(userId);
        }
        
        if (!user) {
            console.error(`[Users] User not found - email: ${userEmail}, ID: ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify email matches (security check)
        if (user.email.toLowerCase() !== userEmail.toLowerCase()) {
            console.error(`[Users] Email mismatch! DB: ${user.email}, Token: ${userEmail}`);
            return res.status(403).json({ error: 'Email mismatch' });
        }
        
        // SQLite returns boolean as 0/1, convert to proper boolean
        const approved = user.approved === 1 || user.approved === true || Boolean(user.approved);
        const enabled = user.enabled === 1 || user.enabled === true || Boolean(user.enabled);
        
        res.json({
            approved: approved,
            enabled: enabled,
            role: user.role
        });
    } catch (error) {
        console.error('[Users] ❌ Error checking user status:', error);
        console.error('[Users] Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to check user status', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * Get all users with approval/enabled status
 * GET /api/users
 * Trainer only
 */
router.get('/', authenticateToken, requireTrainer, (req, res) => {
    try {
        const users = userDB.getAllWithStatus();
        res.json(users);
    } catch (error) {
        console.error('[Users] Error fetching users:', error);
        console.error('[Users] Error stack:', error.stack);
        
        // Provide more detailed error information
        let errorMessage = 'Failed to fetch users';
        if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ 
            error: errorMessage,
            message: error.message || 'An unexpected error occurred while fetching users',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * Approve a user
 * POST /api/users/:id/approve
 * Trainer only
 */
router.post('/:id/approve', authenticateToken, requireTrainer, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = userDB.getById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role === 'trainer') {
            return res.status(400).json({ error: 'Trainers are already approved' });
        }

        try {
            const success = userDB.approve(userId);
            if (success) {
                const updatedUser = userDB.getById(userId);
                console.log(`[Users] User ${userId} (${user.email}) approved by trainer ${req.user.email}`);
                res.json({ 
                    success: true, 
                    message: 'User approved successfully',
                    user: updatedUser
                });
            } else {
                res.status(404).json({ error: 'User not found or already approved' });
            }
        } catch (dbError) {
            console.error(`[Users] Database error approving user ${userId}:`, dbError);
            res.status(500).json({ 
                error: 'Failed to approve user',
                message: dbError.message || 'Database error occurred'
            });
        }
    } catch (error) {
        console.error('[Users] Error approving user:', error);
        res.status(500).json({ error: 'Failed to approve user', message: error.message });
    }
});

/**
 * Disable a user
 * POST /api/users/:id/disable
 * Trainer only
 */
router.post('/:id/disable', authenticateToken, requireTrainer, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = userDB.getById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role === 'trainer') {
            return res.status(400).json({ error: 'Cannot disable trainer accounts' });
        }

        const success = userDB.disable(userId);
        if (success) {
            console.log(`[Users] User ${userId} (${user.email}) disabled by trainer ${req.user.email}`);
            res.json({ 
                success: true, 
                message: 'User disabled successfully',
                user: userDB.getById(userId)
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('[Users] Error disabling user:', error);
        res.status(500).json({ error: 'Failed to disable user', message: error.message });
    }
});

/**
 * Enable a user
 * POST /api/users/:id/enable
 * Trainer only
 */
router.post('/:id/enable', authenticateToken, requireTrainer, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = userDB.getById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const success = userDB.enable(userId);
        if (success) {
            console.log(`[Users] User ${userId} (${user.email}) enabled by trainer ${req.user.email}`);
            res.json({ 
                success: true, 
                message: 'User enabled successfully',
                user: userDB.getById(userId)
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('[Users] Error enabling user:', error);
        res.status(500).json({ error: 'Failed to enable user', message: error.message });
    }
});

/**
 * Delete a user
 * DELETE /api/users/:id
 * Trainer only
 */
router.delete('/:id', authenticateToken, requireTrainer, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = userDB.getById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role === 'trainer') {
            return res.status(400).json({ error: 'Cannot delete trainer accounts' });
        }

        // Prevent deleting yourself
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        // Delete user (cascade will handle submissions)
        try {
            const success = userDB.delete(userId);
            if (success) {
                console.log(`[Users] User ${userId} (${user.email}) deleted by trainer ${req.user.email}`);
                res.json({ 
                    success: true, 
                    message: 'User deleted successfully'
                });
            } else {
                console.warn(`[Users] Delete failed: User ${userId} not found or already deleted`);
                res.status(404).json({ error: 'User not found or already deleted' });
            }
        } catch (dbError) {
            console.error(`[Users] Database error deleting user ${userId}:`, dbError);
            res.status(500).json({ 
                error: 'Failed to delete user',
                message: dbError.message || 'Database error occurred',
                details: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
            });
        }
    } catch (error) {
        console.error('[Users] Error deleting user:', error);
        res.status(500).json({ 
            error: 'Failed to delete user', 
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;

