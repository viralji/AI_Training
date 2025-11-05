#!/usr/bin/env node

/**
 * Seed assignments into the database
 * This script creates all assignments from the frontend slide data
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path: Use DATABASE_PATH env var if set, otherwise use same path resolution as main code
// Works in both Docker (/app/database.sqlite) and non-Docker (backend/database.sqlite)
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../database.sqlite');

console.log(`📁 Using database: ${dbPath}`);

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema if needed (works in both Docker and non-Docker)
const schemaPath = process.env.DATABASE_PATH 
    ? join(__dirname, 'src/db/schema.sql')  // Docker: /app/src/db/schema.sql
    : join(__dirname, 'src/db/schema.sql'); // Non-Docker: backend/src/db/schema.sql
const schema = readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// Assignments to seed (from frontend/src/data/slideContent.js)
const assignments = [
    {
        slide_id: 'slide-2a',
        title: 'Assignment • Spot Your Time Sink',
        description: 'Write ONE thing you do that is repetitive / time‑consuming / mind‑numbing.',
        time_limit: 300, // 5 minutes
        rubric: JSON.stringify({
            criteria: 'Relevance, clarity, and specificity of the time sink identified',
            maxScore: 100
        })
    },
    {
        slide_id: 'slide-5a',
        title: 'Assignment 1',
        description: 'Define one repetitive task; outline a 3‑step automation using an AI tool.',
        time_limit: 600, // 10 minutes
        rubric: JSON.stringify({
            criteria: 'Task identification, automation steps, and AI tool selection',
            maxScore: 100
        })
    },
    {
        slide_id: 'slide-5b',
        title: 'Assignment 2',
        description: 'Draft a prompt to summarize a 5‑page PDF into 5 bullets + 1 risk.',
        time_limit: 600, // 10 minutes
        rubric: JSON.stringify({
            criteria: 'Prompt quality, summary accuracy, and risk identification',
            maxScore: 100
        })
    },
    {
        slide_id: 'slide-5c',
        title: 'Assignment 3',
        description: 'Create an email reply using tone: "Crisp, polite, decisive"; include 2 action items.',
        time_limit: 600, // 10 minutes
        rubric: JSON.stringify({
            criteria: 'Tone adherence, clarity, and action item quality',
            maxScore: 100
        })
    },
    {
        slide_id: 'slide-5d',
        title: 'Assignment 4',
        description: 'Design a table of KPIs and ask the model to compute last month\'s deltas.',
        time_limit: 900, // 15 minutes
        rubric: JSON.stringify({
            criteria: 'KPI selection, table design, and delta calculation accuracy',
            maxScore: 100
        })
    },
    {
        slide_id: 'slide-5e',
        title: 'Assignment 5',
        description: 'Build a small agent flow: fetch → analyze → notify (describe steps in plain English).',
        time_limit: 900, // 15 minutes
        rubric: JSON.stringify({
            criteria: 'Flow design, step clarity, and logical sequence',
            maxScore: 100
        })
    }
];

// Insert assignments
const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO assignments (slide_id, title, description, time_limit, rubric, status)
    VALUES (?, ?, ?, ?, ?, 'hidden')
`);

const insertMany = db.transaction((assignments) => {
    let inserted = 0;
    let skipped = 0;
    
    for (const assignment of assignments) {
        try {
            insertStmt.run(
                assignment.slide_id,
                assignment.title,
                assignment.description,
                assignment.time_limit,
                assignment.rubric
            );
            inserted++;
            console.log(`✅ Inserted: ${assignment.slide_id} - ${assignment.title}`);
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                console.log(`⏭️  Skipped (already exists): ${assignment.slide_id}`);
                skipped++;
            } else {
                console.error(`❌ Error inserting ${assignment.slide_id}:`, error.message);
                throw error;
            }
        }
    }
    
    return { inserted, skipped };
});

console.log('\n🌱 Seeding assignments...\n');

const result = insertMany(assignments);

console.log(`\n✅ Done! Inserted: ${result.inserted}, Skipped: ${result.skipped}, Total: ${assignments.length}`);

db.close();

