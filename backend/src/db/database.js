import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path: Use DATABASE_PATH env var if set, otherwise use relative path
// This works in both Docker (/app/database.sqlite) and non-Docker (backend/database.sqlite)
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../database.sqlite');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency (allows concurrent reads and writes)
db.pragma('journal_mode = WAL');

// Set busy timeout to handle concurrent writes gracefully (5 seconds)
// This allows SQLite to wait for locks to be released instead of immediately failing
db.pragma('busy_timeout = 5000');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// Auto-seed assignments if none exist
const assignments = [
    {
        slide_id: 'slide-2a',
        title: 'Assignment • Spot Your Time Sink',
        description: 'Write ONE thing you do that is repetitive / time‑consuming / mind‑numbing.',
        time_limit: 300,
        rubric: JSON.stringify({
            criteria: 'Relevance, clarity, and specificity of the time sink identified',
            maxScore: 100
        })
    },
    {
        slide_id: 'slide-5a',
        title: 'Assignment 1',
        description: 'Define one repetitive task; outline a 3‑step automation using an AI tool.',
        time_limit: 600,
        rubric: JSON.stringify({
            criteria: 'Task identification, automation steps, and AI tool selection',
            maxScore: 100
        })
    },
    {
        slide_id: 'slide-5b',
        title: 'Assignment 2',
        description: 'Draft a prompt to summarize a 5‑page PDF into 5 bullets + 1 risk.',
        time_limit: 600,
        rubric: JSON.stringify({
            criteria: 'Prompt quality, summary accuracy, and risk identification',
            maxScore: 100
        })
    },
    {
        slide_id: 'slide-5c',
        title: 'Assignment 3',
        description: 'Create an email reply using tone: "Crisp, polite, decisive"; include 2 action items.',
        time_limit: 600,
        rubric: JSON.stringify({
            criteria: 'Tone adherence, clarity, and action item quality',
            maxScore: 100
        })
    },
    {
        slide_id: 'slide-5d',
        title: 'Assignment 4',
        description: 'Design a table of KPIs and ask the model to compute last month\'s deltas.',
        time_limit: 900,
        rubric: JSON.stringify({
            criteria: 'KPI selection, table design, and delta calculation accuracy',
            maxScore: 100
        })
    },
    {
        slide_id: 'slide-5e',
        title: 'Assignment 5',
        description: 'Build a small agent flow: fetch → analyze → notify (describe steps in plain English).',
        time_limit: 900,
        rubric: JSON.stringify({
            criteria: 'Flow design, step clarity, and logical sequence',
            maxScore: 100
        })
    }
];

// Check if assignments exist, if not, seed them
const checkAssignments = db.prepare('SELECT COUNT(*) as count FROM assignments');
const assignmentCount = checkAssignments.get();
if (assignmentCount.count === 0) {
    console.log('📝 No assignments found. Auto-seeding assignments...');
    const insertStmt = db.prepare(`
        INSERT INTO assignments (slide_id, title, description, time_limit, rubric, status)
        VALUES (?, ?, ?, ?, ?, 'hidden')
    `);
    const insertMany = db.transaction((assignments) => {
        for (const assignment of assignments) {
            insertStmt.run(
                assignment.slide_id,
                assignment.title,
                assignment.description,
                assignment.time_limit,
                assignment.rubric
            );
        }
    });
    insertMany(assignments);
    console.log(`✅ Auto-seeded ${assignments.length} assignments`);
} else {
    console.log(`📋 Found ${assignmentCount.count} existing assignments`);
}

// User operations
export const userDB = {
    findByGoogleId: (googleId) => {
        const stmt = db.prepare('SELECT * FROM users WHERE google_id = ?');
        return stmt.get(googleId);
    },
    findByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    },
    create: (userData) => {
        // Trainers are auto-approved, trainees require approval
        const approved = userData.role === 'trainer' ? 1 : 0;
        const stmt = db.prepare(`
            INSERT INTO users (google_id, email, name, role, avatar_url, approved, enabled)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `);
        const { lastInsertRowid } = stmt.run(
            userData.google_id,
            userData.email,
            userData.name,
            userData.role,
            userData.avatar_url,
            approved
        );
        return { id: lastInsertRowid, ...userData, approved: approved === 1, enabled: true };
    },
    updateAvatar: (userId, avatarUrl) => {
        const stmt = db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?');
        stmt.run(avatarUrl, userId);
    },
    getAll: () => {
        const stmt = db.prepare('SELECT id, email, name, role, created_at FROM users');
        return stmt.all();
    },
    getAllWithStatus: () => {
        try {
            // Check if updated_at column exists, if not, select without it
            const columns = db.prepare('PRAGMA table_info(users)').all();
            const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
            
            const selectColumns = hasUpdatedAt 
                ? 'id, email, name, role, avatar_url, approved, enabled, created_at, updated_at'
                : 'id, email, name, role, avatar_url, approved, enabled, created_at';
            
            const stmt = db.prepare(`
                SELECT ${selectColumns}
                FROM users
                ORDER BY created_at DESC
            `);
            return stmt.all();
        } catch (error) {
            console.error('[Database] Error in getAllWithStatus:', error);
            throw error;
        }
    },
    getById: (userId) => {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(userId);
    },
    approve: (userId) => {
        const stmt = db.prepare('UPDATE users SET approved = 1 WHERE id = ?');
        const result = stmt.run(userId);
        return result.changes > 0;
    },
    disable: (userId) => {
        const stmt = db.prepare('UPDATE users SET enabled = 0 WHERE id = ?');
        const result = stmt.run(userId);
        return result.changes > 0;
    },
    enable: (userId) => {
        const stmt = db.prepare('UPDATE users SET enabled = 1 WHERE id = ?');
        const result = stmt.run(userId);
        return result.changes > 0;
    },
    delete: (userId) => {
        try {
            // First verify foreign keys are enabled
            const fkCheck = db.prepare("PRAGMA foreign_keys").get();
            if (!fkCheck || fkCheck.foreign_keys !== 1) {
                console.warn('[Database] Foreign keys not enabled, enabling now...');
                db.pragma('foreign_keys = ON');
            }
            
            // Foreign key constraints will handle cascading deletes
            const stmt = db.prepare('DELETE FROM users WHERE id = ?');
            const result = stmt.run(userId);
            
            if (result.changes === 0) {
                console.warn(`[Database] Delete user ${userId}: No rows affected (user may not exist)`);
                return false;
            }
            
            console.log(`[Database] User ${userId} deleted successfully (${result.changes} row(s) affected)`);
            return true;
        } catch (error) {
            console.error(`[Database] Error deleting user ${userId}:`, error);
            throw error;
        }
    }
};

// Assignment operations
export const assignmentDB = {
    getAll: () => {
        const stmt = db.prepare('SELECT * FROM assignments ORDER BY id');
        return stmt.all();
    },
    getById: (id) => {
        const stmt = db.prepare('SELECT * FROM assignments WHERE id = ?');
        return stmt.get(id);
    },
    getBySlideId: (slideId) => {
        const stmt = db.prepare('SELECT * FROM assignments WHERE slide_id = ?');
        return stmt.get(slideId);
    },
    create: (assignmentData) => {
        const stmt = db.prepare(`
            INSERT INTO assignments (title, description, slide_id, time_limit, rubric)
            VALUES (?, ?, ?, ?, ?)
        `);
        const { lastInsertRowid } = stmt.run(
            assignmentData.title,
            assignmentData.description,
            assignmentData.slide_id,
            assignmentData.time_limit,
            assignmentData.rubric
        );
        return { id: lastInsertRowid, ...assignmentData };
    },
    updateStatus: (id, status) => {
        const stmt = db.prepare(`
            UPDATE assignments 
            SET status = ?, started_at = CASE WHEN status = 'hidden' AND ? = 'active' THEN datetime('now') ELSE started_at END,
                completed_at = CASE WHEN ? = 'completed' THEN datetime('now') ELSE completed_at END
            WHERE id = ?
        `);
        stmt.run(status, status, status, id);
    },
    updateStatusBySlideId: (slideId, status) => {
        const stmt = db.prepare(`
            UPDATE assignments 
            SET status = ?, started_at = CASE WHEN status = 'hidden' AND ? = 'active' THEN datetime('now') ELSE started_at END,
                completed_at = CASE WHEN ? = 'completed' THEN datetime('now') ELSE completed_at END
            WHERE slide_id = ?
        `);
        return stmt.run(status, status, status, slideId);
    },
    getActive: () => {
        const stmt = db.prepare('SELECT * FROM assignments WHERE status = ?');
        return stmt.all('active');
    }
};

// Submission operations
export const submissionDB = {
    create: (submissionData) => {
        // Use INSERT OR IGNORE to handle race conditions gracefully
        // The UNIQUE constraint on (assignment_id, user_id) will prevent duplicates
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO submissions (assignment_id, user_id, content, image_path, image_filename, submission_time)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            submissionData.assignment_id,
            submissionData.user_id,
            submissionData.content,
            submissionData.image_path || null,
            submissionData.image_filename || null,
            submissionData.submission_time
        );
        
        // If no row was inserted (duplicate), return null
        if (result.changes === 0) {
            return null;
        }
        
        return result.lastInsertRowid;
    },
    
    // Transaction-based create for atomic operations
    createWithTransaction: (submissionData) => {
        const transaction = db.transaction((data) => {
            // Check if submission already exists
            const checkStmt = db.prepare(`
                SELECT id FROM submissions
                WHERE assignment_id = ? AND user_id = ?
            `);
            const existing = checkStmt.get(data.assignment_id, data.user_id);
            
            if (existing) {
                return { id: existing.id, isDuplicate: true };
            }
            
            // Insert new submission
            const insertStmt = db.prepare(`
                INSERT INTO submissions (assignment_id, user_id, content, image_path, image_filename, submission_time)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            const result = insertStmt.run(
                data.assignment_id,
                data.user_id,
                data.content,
                data.image_path || null,
                data.image_filename || null,
                data.submission_time
            );
            
            return { id: result.lastInsertRowid, isDuplicate: false };
        });
        
        return transaction(submissionData);
    },
    getByAssignment: (assignmentId) => {
        const stmt = db.prepare(`
            SELECT s.*, u.name, u.email, u.updated_at as approved_at
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            WHERE s.assignment_id = ?
            ORDER BY s.submitted_at ASC
        `);
        return stmt.all(assignmentId);
    },
    getByAssignmentAndUser: (assignmentId, userId) => {
        const stmt = db.prepare(`
            SELECT * FROM submissions
            WHERE assignment_id = ? AND user_id = ?
        `);
        return stmt.get(assignmentId, userId);
    },
    updateScore: (submissionId, score, aiFeedback) => {
        const stmt = db.prepare(`
            UPDATE submissions
            SET score = ?, ai_feedback = ?, is_graded = 1
            WHERE id = ?
        `);
        stmt.run(score, aiFeedback, submissionId);
    },
    getAll: () => {
        const stmt = db.prepare(`
            SELECT s.*, u.name, u.email, a.title as assignment_title
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            JOIN assignments a ON s.assignment_id = a.id
            ORDER BY s.submitted_at DESC
        `);
        return stmt.all();
    },
    deleteByAssignment: (assignmentId) => {
        const stmt = db.prepare('DELETE FROM submissions WHERE assignment_id = ?');
        const result = stmt.run(assignmentId);
        return result.changes;
    },
    
    // Get all submissions for a specific user with assignment details
    getUserSubmissionsWithDetails: (userId) => {
        const stmt = db.prepare(`
            SELECT 
                s.id,
                s.content,
                s.submitted_at,
                s.submission_time,
                s.score,
                s.ai_feedback,
                s.is_graded,
                a.id as assignment_id,
                a.title as assignment_title,
                a.description as assignment_description,
                a.slide_id,
                a.time_limit
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            WHERE s.user_id = ?
            ORDER BY s.submitted_at ASC
        `);
        return stmt.all(userId);
    },
    
    // Get all users with their submissions (for email reports)
    // Only return enabled users
    getAllUsersWithSubmissions: () => {
        const stmt = db.prepare(`
            SELECT DISTINCT
                u.id,
                u.email,
                u.name,
                u.role
            FROM users u
            WHERE u.role = 'trainee' AND u.enabled = 1
            ORDER BY u.name ASC
        `);
        return stmt.all();
    }
};

// Session operations
export const sessionDB = {
    create: (trainerId) => {
        const stmt = db.prepare('INSERT INTO sessions (trainer_id) VALUES (?)');
        const { lastInsertRowid } = stmt.run(trainerId);
        return lastInsertRowid;
    },
    end: (sessionId) => {
        const stmt = db.prepare('UPDATE sessions SET ended_at = datetime("now") WHERE id = ?');
        stmt.run(sessionId);
    }
};

// Database initialized successfully

