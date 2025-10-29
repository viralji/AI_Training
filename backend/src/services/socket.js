import { Server } from 'socket.io';

let io = null;
let activeAssignments = new Set(); // Track active assignments globally

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            // Client disconnected
        });

        // Join training room
        socket.on('join-training', () => {
            socket.join('training-room');
            
            // Send current active assignments to the newly joined client
            if (activeAssignments.size > 0) {
                const activeAssignmentsArray = Array.from(activeAssignments);
                socket.emit('active-assignments', { assignments: activeAssignmentsArray });
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
            io.to('training-room').emit('assignment:started', { slideId });
        }
    },
    
    emitAssignmentEnded: (assignmentId) => {
        if (io) {
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
            io.to('training-room').emit('submission:scored', submission);
        }
    },
    
    emitAssignmentReset: (slideId) => {
        if (io) {
            // Remove from active assignments
            activeAssignments.delete(slideId);
            // Broadcast reset event to all clients
            io.to('training-room').emit('assignment:reset', { slideId });
        }
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

