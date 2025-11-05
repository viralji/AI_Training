import jwt from 'jsonwebtoken';
import { userDB } from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        
        // Allow check-status endpoint to bypass approval check
        // This allows trainees to check their approval status
        // Check both path (route relative) and originalUrl (full path)
        const isStatusCheck = req.path === '/check-status' || 
                             req.path.endsWith('/check-status') ||
                             req.originalUrl.includes('/check-status') ||
                             req.url.includes('/check-status');
        
        // For trainees, check approval status from database
        // Trainers always have access
        if (user.role === 'trainee' && !isStatusCheck) {
            try {
                // Find by email first (more reliable), then by ID
                let dbUser = userDB.findByEmail(user.email);
                if (!dbUser) {
                    console.warn(`[Auth] User not found by email ${user.email}, trying ID ${user.id}`);
                    dbUser = userDB.getById(user.id);
                }
                
                if (!dbUser) {
                    console.error(`[Auth] User not found - email: ${user.email}, ID: ${user.id}`);
                    return res.status(403).json({ error: 'User not found' });
                }
                
                // SQLite returns 0/1, convert to boolean
                const isApproved = dbUser.approved === 1 || dbUser.approved === true || Boolean(dbUser.approved);
                const isEnabled = dbUser.enabled === 1 || dbUser.enabled === true || Boolean(dbUser.enabled);
                
                if (!isApproved) {
                    return res.status(403).json({ 
                        error: 'Account pending approval',
                        message: 'Your account is pending trainer approval. Please contact the trainer.',
                        code: 'PENDING_APPROVAL'
                    });
                }
                
                if (!isEnabled) {
                    return res.status(403).json({ 
                        error: 'Account disabled',
                        message: 'Your account has been disabled. Please contact the trainer.',
                        code: 'ACCOUNT_DISABLED'
                    });
                }
                
                // Update user object with latest approval/enabled status
                req.user = { ...user, approved: isApproved, enabled: isEnabled };
            } catch (error) {
                console.error('[Auth] Error checking user approval status:', error);
                return res.status(500).json({ error: 'Failed to verify user status' });
            }
        } else {
            // Trainers always have access, or status check endpoint
            // For status check, also get latest approval status
            if (isStatusCheck && user.role === 'trainee') {
                try {
                    const dbUser = userDB.getById(user.id);
                    if (dbUser) {
                        req.user = { ...user, approved: dbUser.approved || false, enabled: dbUser.enabled || false };
                    } else {
                        req.user = user;
                    }
                } catch (error) {
                    console.error('[Auth] Error getting user status:', error);
                    req.user = user;
                }
            } else {
                req.user = user;
            }
        }
        
        next();
    });
};

export const requireTrainer = (req, res, next) => {
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ error: 'Trainer access required' });
    }
    next();
};

export const requireTrainee = (req, res, next) => {
    if (req.user.role !== 'trainee') {
        return res.status(403).json({ error: 'Trainee access required' });
    }
    next();
};

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Helper to check if email is authorized as trainer
export const isAuthorizedTrainer = (email) => {
    const trainerEmails = (process.env.TRAINER_EMAILS || '').split(',').map(e => e.trim());
    return trainerEmails.includes(email.toLowerCase());
};

// Helper to check if email domain is whitelisted
export const isWhitelistedDomain = (email) => {
    const domain = process.env.TRAINEE_DOMAIN;
    if (!domain) return true; // No domain restriction
    return email.toLowerCase().endsWith(domain.toLowerCase());
};

