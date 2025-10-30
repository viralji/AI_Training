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
            console.log('OAuth callback received');
            const googleUser = req.user;
            console.log('Google user:', googleUser);
            
            // Check if user exists in database
            let user = userDB.findByGoogleId(googleUser.id);
            console.log('User from DB:', user);
            
            if (!user) {
                // Determine role based on email
                const role = googleUser.email === process.env.TRAINER_EMAILS ? 'trainer' : 'trainee';
                console.log('Creating new user with role:', role);
                
                // Create new user
                user = userDB.create({
                    google_id: googleUser.id,
                    email: googleUser.email,
                    name: googleUser.name,
                    role: role,
                    avatar_url: googleUser.picture
                });
            }
            
            // Generate token
            const token = generateToken(user);
            console.log('Generated token, redirecting to:', process.env.FRONTEND_URL || 'http://localhost:5173');
            
            // Redirect to frontend with token
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar_url
            }))}`;
            
            console.log('Redirect URL:', redirectUrl);
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Auth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
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

