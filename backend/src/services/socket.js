import { Server } from 'socket.io';
import { assignmentDB } from '../db/database.js';

let io = null;
let activeAssignments = new Set(); // Track active assignments globally

// Sync activeAssignments Set with database
const syncActiveAssignmentsFromDB = () => {
    try {
        const activeFromDB = assignmentDB.getActive();
        activeAssignments.clear();
        activeFromDB.forEach(assignment => {
            if (assignment.slide_id) {
                activeAssignments.add(assignment.slide_id);
            }
        });
        console.log(`[Socket] Synced activeAssignments from database. Active: ${Array.from(activeAssignments).join(', ') || 'none'}`);
    } catch (error) {
        console.error('[Socket] Error syncing activeAssignments from database:', error);
    }
};

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true
        }
    });

    // Sync activeAssignments with database on startup
    syncActiveAssignmentsFromDB();

    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            // Client disconnected
        });

        // Join training room
        socket.on('join-training', () => {
            socket.join('training-room');
            
            // Sync with database before sending (in case server restarted)
            syncActiveAssignmentsFromDB();
            
            // Send current active assignments to the newly joined client
            if (activeAssignments.size > 0) {
                const activeAssignmentsArray = Array.from(activeAssignments);
                console.log(`[Socket] Sending active assignments to new client: ${activeAssignmentsArray.join(', ')}`);
                socket.emit('active-assignments', { assignments: activeAssignmentsArray });
            } else {
                console.log('[Socket] No active assignments to send to new client');
            }
        });

        // Leave training room
        socket.on('leave-training', () => {
            socket.leave('training-room');
        });

        // Start assignment (emitted by trainer)
        socket.on('assignment:start', (data) => {
            // Add to active assignments
            activeAssignments.add(data.slideId);
            // Broadcast to all in training-room (including newly joined)
            io.to('training-room').emit('assignment:started', { slideId: data.slideId });
        });

        // Receive submission from trainee and broadcast to trainer
        socket.on('submission:send', (data) => {
            // Broadcast to trainer (who is also in training-room)
            io.to('training-room').emit('submission:received', data);
        });

        // End assignment
        socket.on('assignment:end', (data) => {
            activeAssignments.delete(data.slideId);
            io.to('training-room').emit('assignment:ended', { slideId: data.slideId });
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Helper functions to emit events
export const socketEvents = {
    emitAssignmentStarted: (slideId) => {
        if (io) {
            // Add to active assignments Set
            activeAssignments.add(slideId);
            console.log(`[Socket] Added ${slideId} to activeAssignments. Total active: ${activeAssignments.size}`);
            
            // Broadcast to all in training-room
            io.to('training-room').emit('assignment:started', { slideId });
            console.log(`[Socket] Emitted assignment:started for ${slideId} to training-room`);
        } else {
            console.error('[Socket] Cannot emit assignment:started - Socket.io not initialized');
        }
    },
    
    emitAssignmentEnded: (assignmentId) => {
        if (io) {
            // Remove from active assignments Set
            activeAssignments.delete(assignmentId);
            console.log(`[Socket] Removed ${assignmentId} from activeAssignments. Total active: ${activeAssignments.size}`);
            
            io.to('training-room').emit('assignment:ended', { assignmentId });
        }
    },
    
    emitSubmissionReceived: (submission) => {
        if (io) {
            io.to('training-room').emit('submission:received', submission);
        }
    },
    
    emitSubmissionScored: (submission) => {
        if (io) {
            console.log(`[Socket] Emitting submission:scored for submission ${submission.id}, score: ${submission.score}/10`);
            io.to('training-room').emit('submission:scored', submission);
            console.log(`[Socket] ✅ submission:scored event sent to training-room`);
        } else {
            console.error('[Socket] Cannot emit submission:scored - Socket.io not initialized');
        }
    },
    
    emitAssignmentReset: (slideId) => {
        if (io) {
            // Remove from active assignments
            activeAssignments.delete(slideId);
            console.log(`[Socket] Removed ${slideId} from activeAssignments after reset. Total active: ${activeAssignments.size}`);
            
            // Sync with database to ensure consistency
            syncActiveAssignmentsFromDB();
            
            // Broadcast reset event to all clients
            io.to('training-room').emit('assignment:reset', { slideId });
        }
    },
    
    // Function to sync activeAssignments from database (useful after server restart)
    syncActiveAssignments: () => {
        syncActiveAssignmentsFromDB();
    },
    
    emitScoringComplete: (assignmentId, results) => {
        if (io) {
            io.to('training-room').emit('scoring:complete', { assignmentId, results });
        }
    },
    
    emitLeaderboardUpdate: (assignmentId, leaderboard) => {
        if (io) {
            io.to('training-room').emit('leaderboard:update', { assignmentId, leaderboard });
        }
    }
};

