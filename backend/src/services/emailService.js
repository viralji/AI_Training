import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

/**
 * Email Service
 * 
 * Handles sending emails to users with their training reports
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Check if email is configured
    if (!config.email.smtp.auth.user || !config.email.smtp.auth.pass) {
      console.warn('⚠️  Email not configured - SMTP_USER and SMTP_PASS must be set in environment variables');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: {
          user: config.email.smtp.auth.user,
          pass: config.email.smtp.auth.pass
        }
      });

      this.isConfigured = true;
      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Generate HTML email template for user report
   * @param {Object} user - User object with name and email
   * @param {Array} submissions - Array of submissions with assignment details
   * @returns {string} HTML email content
   */
  generateReportEmail(user, submissions) {
    const userName = user.name || user.email || 'Participant';
    const submissionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let submissionsHtml = '';
    
    if (submissions.length === 0) {
      submissionsHtml = `
        <tr>
          <td colspan="4" style="padding: 20px; text-align: center; color: #666;">
            No submissions found for this training session.
          </td>
        </tr>
      `;
    } else {
      submissionsHtml = submissions.map((submission, index) => {
        const assignmentTitle = submission.assignment_title || submission.title || `Assignment ${index + 1}`;
        const score = submission.score !== null && submission.score !== undefined ? `${submission.score}/10` : 'Not scored';
        const feedback = submission.ai_feedback || 'No feedback available';
        const submittedAt = submission.submitted_at 
          ? new Date(submission.submitted_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'N/A';
        
        // Truncate long content for display
        const contentPreview = submission.content 
          ? (submission.content.length > 500 
              ? submission.content.substring(0, 500) + '...' 
              : submission.content)
          : 'No content';

        return `
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 15px; vertical-align: top;">
              <strong style="color: #333; font-size: 16px;">${assignmentTitle}</strong>
              <br>
              <span style="color: #666; font-size: 12px;">Submitted: ${submittedAt}</span>
            </td>
            <td style="padding: 15px; vertical-align: top; color: #555;">
              ${contentPreview.replace(/\n/g, '<br>')}
            </td>
            <td style="padding: 15px; vertical-align: top; text-align: center;">
              <span style="font-size: 18px; font-weight: bold; color: ${submission.score >= 7 ? '#22c55e' : submission.score >= 5 ? '#f59e0b' : '#ef4444'};">
                ${score}
              </span>
            </td>
            <td style="padding: 15px; vertical-align: top; color: #555; font-size: 14px;">
              ${feedback.replace(/\n/g, '<br>')}
            </td>
          </tr>
        `;
      }).join('');
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Training Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3bb6ff 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">AI Literacy Training Report</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.6;">
                Dear <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 25px 0; color: #555; font-size: 15px; line-height: 1.6;">
                Thank you for participating in the AI Literacy Training. Below is a summary of your submissions and scores for each assignment:
              </p>
              
              <!-- Submissions Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; margin-bottom: 25px;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px 15px; text-align: left; font-size: 14px; font-weight: 600; color: #333; border-bottom: 2px solid #e0e0e0;">Assignment</th>
                    <th style="padding: 12px 15px; text-align: left; font-size: 14px; font-weight: 600; color: #333; border-bottom: 2px solid #e0e0e0;">Your Response</th>
                    <th style="padding: 12px 15px; text-align: center; font-size: 14px; font-weight: 600; color: #333; border-bottom: 2px solid #e0e0e0;">Score</th>
                    <th style="padding: 12px 15px; text-align: left; font-size: 14px; font-weight: 600; color: #333; border-bottom: 2px solid #e0e0e0;">AI Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  ${submissionsHtml}
                </tbody>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                We hope this training has been valuable in building your AI literacy skills. If you have any questions or feedback, please don't hesitate to reach out.
              </p>
              
              <p style="margin: 25px 0 0 0; color: #333; font-size: 15px;">
                Best regards,<br>
                <strong>${config.email.fromName}</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                This is an automated report generated on ${submissionDate}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return html;
  }

  /**
   * Send training report email to a user
   * @param {Object} user - User object with email and name
   * @param {Array} submissions - Array of submissions with assignment details
   * @returns {Promise<Object>} Result object with success status and error if any
   */
  async sendReportEmail(user, submissions) {
    if (!this.isConfigured || !this.transporter) {
      return {
        success: false,
        error: 'Email service is not configured. Please set SMTP_USER and SMTP_PASS in environment variables.'
      };
    }

    if (!user.email) {
      return {
        success: false,
        error: 'User email is missing'
      };
    }

    try {
      const html = this.generateReportEmail(user, submissions);
      const userName = user.name || user.email;

      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.from}>`,
        to: user.email,
        subject: `Your AI Training Report - ${userName}`,
        html: html,
        text: this.generateTextVersion(user, submissions)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent to ${user.email}: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error(`❌ Failed to send email to ${user.email}:`, error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate plain text version of email
   * @param {Object} user - User object
   * @param {Array} submissions - Array of submissions
   * @returns {string} Plain text email content
   */
  generateTextVersion(user, submissions) {
    const userName = user.name || user.email || 'Participant';
    let text = `Dear ${userName},\n\n`;
    text += `Thank you for participating in the AI Literacy Training. Below is a summary of your submissions and scores:\n\n`;

    if (submissions.length === 0) {
      text += 'No submissions found for this training session.\n\n';
    } else {
      submissions.forEach((submission, index) => {
        const assignmentTitle = submission.assignment_title || submission.title || `Assignment ${index + 1}`;
        const score = submission.score !== null && submission.score !== undefined ? `${submission.score}/10` : 'Not scored';
        const feedback = submission.ai_feedback || 'No feedback available';
        
        text += `Assignment: ${assignmentTitle}\n`;
        text += `Your Response: ${submission.content || 'No content'}\n`;
        text += `Score: ${score}\n`;
        text += `AI Feedback: ${feedback}\n\n`;
      });
    }

    text += `Best regards,\n${config.email.fromName}`;
    
    return text;
  }

  /**
   * Verify email configuration
   * @returns {Promise<boolean>} True if email is configured and connection works
   */
  async verifyConnection() {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection verification failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export default new EmailService();

