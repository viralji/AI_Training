import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../database.sqlite');
export const db = new Database(dbPath);

// Initialize database
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

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
        const stmt = db.prepare(`
            INSERT INTO users (google_id, email, name, role, avatar_url)
            VALUES (?, ?, ?, ?, ?)
        `);
        const { lastInsertRowid } = stmt.run(
            userData.google_id,
            userData.email,
            userData.name,
            userData.role,
            userData.avatar_url
        );
        return { id: lastInsertRowid, ...userData };
    },
    updateAvatar: (userId, avatarUrl) => {
        const stmt = db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?');
        stmt.run(avatarUrl, userId);
    },
    getAll: () => {
        const stmt = db.prepare('SELECT id, email, name, role, created_at FROM users');
        return stmt.all();
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
        console.log(`🗄️ Database: Looking for assignment with slideId: ${slideId}`);
        const stmt = db.prepare('SELECT * FROM assignments WHERE slide_id = ?');
        const result = stmt.get(slideId);
        console.log(`🗄️ Database: Found assignment:`, result ? `ID: ${result.id}, Title: ${result.title}, Status: ${result.status}` : 'NOT FOUND');
        return result;
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
        console.log(`🗄️ Database: Updating assignment ${slideId} to status: ${status}`);
        const stmt = db.prepare(`
            UPDATE assignments 
            SET status = ?, started_at = CASE WHEN status = 'hidden' AND ? = 'active' THEN datetime('now') ELSE started_at END,
                completed_at = CASE WHEN ? = 'completed' THEN datetime('now') ELSE completed_at END
            WHERE slide_id = ?
        `);
        const result = stmt.run(status, status, status, slideId);
        console.log(`🗄️ Database: Update result - changes: ${result.changes}, lastInsertRowid: ${result.lastInsertRowid}`);
        return result;
    },
    getActive: () => {
        const stmt = db.prepare('SELECT * FROM assignments WHERE status = ?');
        return stmt.all('active');
    }
};

// Submission operations
export const submissionDB = {
    create: (submissionData) => {
        const stmt = db.prepare(`
            INSERT INTO submissions (assignment_id, user_id, content, image_path, image_filename, submission_time)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const { lastInsertRowid } = stmt.run(
            submissionData.assignment_id,
            submissionData.user_id,
            submissionData.content,
            submissionData.image_path || null,
            submissionData.image_filename || null,
            submissionData.submission_time
        );
        return lastInsertRowid;
    },
    getByAssignment: (assignmentId) => {
        const stmt = db.prepare(`
            SELECT s.*, u.name, u.email
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

