import express from 'express';
import { submissionDB } from '../db/database.js';
import { authenticateToken, requireTrainer } from '../middleware/auth.js';
import emailService from '../services/emailService.js';

const router = express.Router();

/**
 * Send training report emails to all trainees
 * POST /api/emails/send-reports
 * Trainer only
 */
router.post('/send-reports', authenticateToken, requireTrainer, async (req, res) => {
    try {
        console.log('[Email] Starting to send report emails to all trainees...');

        // Verify email service is configured
        const isConfigured = await emailService.verifyConnection();
        if (!isConfigured) {
            return res.status(500).json({
                error: 'Email service is not configured',
                message: 'Please configure SMTP settings (SMTP_HOST, SMTP_USER, SMTP_PASS) in environment variables'
            });
        }

        // Get all trainees
        const trainees = submissionDB.getAllUsersWithSubmissions();
        console.log(`[Email] Found ${trainees.length} trainees to send emails to`);

        if (trainees.length === 0) {
            return res.json({
                success: true,
                message: 'No trainees found',
                sent: 0,
                failed: 0,
                results: []
            });
        }

        // Send emails to each trainee
        const results = [];
        let sentCount = 0;
        let failedCount = 0;

        for (const trainee of trainees) {
            try {
                // Get all submissions for this user
                const submissions = submissionDB.getUserSubmissionsWithDetails(trainee.id);
                console.log(`[Email] Sending report to ${trainee.email} (${submissions.length} submissions)`);

                // Send email
                const result = await emailService.sendReportEmail(trainee, submissions);

                if (result.success) {
                    sentCount++;
                    results.push({
                        email: trainee.email,
                        name: trainee.name,
                        status: 'sent',
                        submissionsCount: submissions.length,
                        messageId: result.messageId
                    });
                } else {
                    failedCount++;
                    results.push({
                        email: trainee.email,
                        name: trainee.name,
                        status: 'failed',
                        error: result.error,
                        submissionsCount: submissions.length
                    });
                }

                // Small delay to avoid overwhelming SMTP server
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                failedCount++;
                console.error(`[Email] Error processing trainee ${trainee.email}:`, error);
                results.push({
                    email: trainee.email,
                    name: trainee.name,
                    status: 'failed',
                    error: error.message,
                    submissionsCount: 0
                });
            }
        }

        console.log(`[Email] Email sending complete: ${sentCount} sent, ${failedCount} failed`);

        res.json({
            success: true,
            message: `Emails sent to ${sentCount} trainees${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
            sent: sentCount,
            failed: failedCount,
            total: trainees.length,
            results: results
        });
    } catch (error) {
        console.error('[Email] Error sending report emails:', error);
        res.status(500).json({
            error: 'Failed to send report emails',
            message: error.message
        });
    }
});

/**
 * Get email service status
 * GET /api/emails/status
 * Trainer only
 */
router.get('/status', authenticateToken, requireTrainer, async (req, res) => {
    try {
        const isConfigured = await emailService.verifyConnection();
        
        res.json({
            configured: isConfigured,
            message: isConfigured 
                ? 'Email service is configured and ready' 
                : 'Email service is not configured. Please set SMTP settings in environment variables.'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to check email service status',
            message: error.message
        });
    }
});

export default router;

