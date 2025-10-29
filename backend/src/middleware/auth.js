import jwt from 'jsonwebtoken';
import { userDB } from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
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

