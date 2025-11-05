import PQueue from 'p-queue';
import geminiService from './gemini.js';
import { submissionDB, assignmentDB } from '../db/database.js';
import { socketEvents } from './socket.js';

/**
 * Scoring Queue Service
 * 
 * Manages a queue of scoring requests with:
 * - Rate limiting (max 10 concurrent API calls to avoid Gemini rate limits)
 * - Retry mechanism with exponential backoff
 * - Error handling and dead-letter queue
 * 
 * Gemini API rate limits are typically 15-60 RPM (requests per minute).
 * We limit to 10 concurrent to stay well within limits.
 */

class ScoringQueueService {
  constructor() {
    // Queue with concurrency limit of 10 to respect Gemini API rate limits
    // This ensures we don't exceed ~60 requests per minute even with retries
    this.queue = new PQueue({
      concurrency: 10,
      interval: 1000, // 1 second between batches
      intervalCap: 10, // Max 10 requests per interval
      timeout: 30000, // 30 second timeout per job
      throwOnTimeout: false
    });

    // Track failed submissions for retry
    this.failedSubmissions = new Map();
    this.maxRetries = 3;
    this.retryDelays = [2000, 5000, 10000]; // Exponential backoff: 2s, 5s, 10s

    // Statistics
    this.stats = {
      total: 0,
      completed: 0,
      failed: 0,
      retrying: 0
    };

    console.log('[ScoringQueue] Initialized with concurrency limit: 10');
  }

  /**
   * Add a submission to the scoring queue
   * @param {number} submissionId - The submission ID
   * @param {string} content - The submission content
   * @param {number} assignmentId - The assignment database ID
   * @param {string} slideId - The assignment slide ID (for frontend compatibility)
   * @param {number} userId - The user ID
   * @param {number} retryCount - Current retry attempt (0 = first attempt)
   */
  async addToQueue(submissionId, content, assignmentId, slideId, userId, retryCount = 0) {
    this.stats.total++;
    
    if (retryCount > 0) {
      this.stats.retrying++;
      console.log(`[ScoringQueue] Retry attempt ${retryCount} for submission ${submissionId}`);
    }

    // Get assignment details for context
    const assignment = assignmentDB.getById(assignmentId);
    if (!assignment) {
      console.error(`[ScoringQueue] Assignment ${assignmentId} not found for submission ${submissionId}`);
      this.stats.failed++;
      return Promise.reject(new Error(`Assignment ${assignmentId} not found`));
    }

    const assignmentTitle = assignment.title || assignment.name || 'Assignment';
    const assignmentInstruction = assignment.instruction || assignment.description || '';

    // Add to queue and return the promise
    const queuePromise = this.queue.add(async () => {
      try {
        // Check if Gemini is available
        if (!geminiService.isAvailable()) {
          throw new Error('Gemini API not available');
        }

        console.log(`[ScoringQueue] Processing submission ${submissionId} (attempt ${retryCount + 1})`);

        // Call Gemini API
        const scoringResult = await geminiService.scoreAssignment(
          content,
          assignmentTitle,
          assignmentInstruction
        );

        // Update submission with score
        submissionDB.updateScore(submissionId, scoringResult.score, scoringResult.feedback);

        // Get updated submission for socket event
        const updatedSubmission = submissionDB.getByAssignmentAndUser(assignmentId, userId);
        
        if (updatedSubmission) {
          updatedSubmission.slideId = slideId;
          
          // Emit socket event for live update
          socketEvents.emitSubmissionScored(updatedSubmission);
          console.log(`[ScoringQueue] ✅ Scored submission ${submissionId}: ${scoringResult.score}/10`);
        }

        // Remove from failed list if it was there
        this.failedSubmissions.delete(submissionId);
        this.stats.completed++;
        
        if (retryCount > 0) {
          this.stats.retrying--;
        }

        return scoringResult;
      } catch (error) {
        console.error(`[ScoringQueue] ❌ Error scoring submission ${submissionId}:`, error.message);
        console.error(`[ScoringQueue] Error stack:`, error.stack);
        
        // Check if we should retry
        if (retryCount < this.maxRetries) {
          const delay = this.retryDelays[retryCount] || 10000;
          console.log(`[ScoringQueue] Scheduling retry for submission ${submissionId} in ${delay}ms`);
          
          // Store for retry
          this.failedSubmissions.set(submissionId, {
            submissionId,
            content,
            assignmentId,
            slideId,
            userId,
            retryCount: retryCount + 1,
            error: error.message,
            nextRetry: Date.now() + delay
          });

          // Schedule retry after delay
          setTimeout(() => {
            const failed = this.failedSubmissions.get(submissionId);
            if (failed) {
              this.addToQueue(
                failed.submissionId,
                failed.content,
                failed.assignmentId,
                failed.slideId,
                failed.userId,
                failed.retryCount
              ).catch(err => {
                console.error(`[ScoringQueue] Retry failed for submission ${submissionId}:`, err);
              });
            }
          }, delay);

          return null;
        } else {
          // Max retries reached - mark as failed
          console.error(`[ScoringQueue] ⚠️ Max retries reached for submission ${submissionId}. Marking as failed.`);
          this.stats.failed++;
          this.stats.retrying--;
          this.failedSubmissions.delete(submissionId);
          
          // Optionally: Update submission with error feedback
          try {
            submissionDB.updateScore(submissionId, 0, `Scoring failed after ${this.maxRetries} attempts: ${error.message}`);
          } catch (dbError) {
            console.error(`[ScoringQueue] Failed to update submission ${submissionId} with error:`, dbError);
          }
          
          return null;
        }
      }
    }, {
      priority: retryCount > 0 ? 1 : 0 // Higher priority for retries
    });

    // Handle queue promise errors
    queuePromise.catch((error) => {
      console.error(`[ScoringQueue] Queue promise rejected for submission ${submissionId}:`, error);
    });

    return queuePromise;
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      ...this.stats,
      queueSize: this.queue.size,
      pending: this.queue.pending,
      failedSubmissions: this.failedSubmissions.size
    };
  }

  /**
   * Get all failed submissions (for monitoring/debugging)
   */
  getFailedSubmissions() {
    return Array.from(this.failedSubmissions.values());
  }

  /**
   * Manually retry a failed submission
   */
  async retryFailedSubmission(submissionId) {
    const failed = this.failedSubmissions.get(submissionId);
    if (!failed) {
      return false;
    }

    // Reset retry count and add back to queue
    failed.retryCount = 0;
    return this.addToQueue(
      failed.submissionId,
      failed.content,
      failed.assignmentId,
      failed.slideId,
      failed.userId,
      0
    );
  }

  /**
   * Clear all failed submissions (use with caution)
   */
  clearFailedSubmissions() {
    this.failedSubmissions.clear();
    this.stats.retrying = 0;
  }
}

// Export singleton instance
export default new ScoringQueueService();

