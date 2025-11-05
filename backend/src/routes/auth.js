import express from 'express';
import passport from 'passport';
import { userDB } from '../db/database.js';
import { generateToken, isAuthorizedTrainer, isWhitelistedDomain } from '../middleware/auth.js';

const router = express.Router();

// Google OAuth routes
router.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const googleUser = req.user;
            
            // Check if user exists in database
            let user = userDB.findByGoogleId(googleUser.id);
            
            if (!user) {
                // Determine role based on email
                const role = googleUser.email === process.env.TRAINER_EMAILS ? 'trainer' : 'trainee';
                
                // Create new user
                // Trainers are auto-approved, trainees require approval
                user = userDB.create({
                    google_id: googleUser.id,
                    email: googleUser.email,
                    name: googleUser.name,
                    role: role,
                    avatar_url: googleUser.picture
                });
            } else {
                // User exists - get latest approval status from DB
                const dbUser = userDB.getById(user.id);
                if (dbUser) {
                    user.approved = dbUser.approved;
                    user.enabled = dbUser.enabled;
                }
            }
            
            // Generate token
            const token = generateToken(user);
            
            // Redirect to frontend with token - include approval status for trainees
            const userData = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar_url
            };
            
            // Include approval status for trainees - ALWAYS get from database by email
            if (user.role === 'trainee') {
                // Get fresh status from database by email (more reliable than ID)
                let dbUser = userDB.findByEmail(user.email);
                if (!dbUser) {
                    dbUser = userDB.getById(user.id);
                }
                
                if (dbUser) {
                    userData.approved = Boolean(dbUser.approved);
                    userData.enabled = Boolean(dbUser.enabled);
                } else {
                    // Fallback - assume not approved if can't find user
                    userData.approved = false;
                    userData.enabled = false;
                }
            }
            
            // Get frontend URL - fail loudly in production if not set
            const frontendUrl = process.env.FRONTEND_URL;
            if (!frontendUrl) {
                console.error('[AUTH] FRONTEND_URL environment variable is not set!');
                if (process.env.NODE_ENV === 'production') {
                    return res.status(500).json({ 
                        error: 'Server configuration error: FRONTEND_URL not set',
                        message: 'Please contact administrator'
                    });
                }
                // Development fallback only
                console.warn('[AUTH] Using development fallback: http://localhost:5173');
            }
            
            const redirectUrl = `${frontendUrl || 'http://localhost:5173'}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
            console.log(`[AUTH] Redirecting to: ${redirectUrl}`);
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Auth callback error:', error);
            const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? null : 'http://localhost:5173');
            if (!frontendUrl) {
                return res.status(500).json({ 
                    error: 'Server configuration error: FRONTEND_URL not set',
                    message: 'Please contact administrator'
                });
            }
            res.redirect(`${frontendUrl}/login?error=auth_failed`);
        }
    }
);

// Logout
router.get('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Get current user
router.get('/auth/user', (req, res) => {
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});


export default router;

