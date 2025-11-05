-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('trainer', 'trainee')),
    avatar_url TEXT,
    approved BOOLEAN DEFAULT 0, -- Trainer approval required for trainees
    enabled BOOLEAN DEFAULT 1, -- User can be disabled after training
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trainer_id INTEGER NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    slide_id TEXT UNIQUE, -- Reference to slide from presentation
    time_limit INTEGER DEFAULT 300, -- Time in seconds
    rubric TEXT, -- JSON string with scoring criteria
    status TEXT DEFAULT 'hidden' CHECK(status IN ('hidden', 'active', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_path TEXT, -- Path to uploaded image file
    image_filename TEXT, -- Original filename
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submission_time INTEGER, -- Time taken in seconds
    score INTEGER CHECK(score >= 0 AND score <= 100), -- 0-100
    ai_feedback TEXT, -- Feedback from Gemini
    is_graded BOOLEAN DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(assignment_id, user_id) -- One submission per user per assignment
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_score ON submissions(score);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_slide_id ON assignments(slide_id);
CREATE INDEX IF NOT EXISTS idx_sessions_trainer ON sessions(trainer_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_assignments_timestamp 
    AFTER UPDATE ON assignments
    BEGIN
        UPDATE assignments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_submissions_timestamp 
    AFTER UPDATE ON submissions
    BEGIN
        UPDATE submissions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

