// =================== COMPLETE EMAIL NOTIFICATION SERVICE ===================
// src/services/emailService.js
import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';

dotenv.config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  static async sendFeedbackNotificationToAdmin(feedbackData, adminEmails) {
    try {
      const { feedback, guest, pool } = feedbackData;
      
      const priorityEmoji = {
        low: '🔵',
        medium: '🟡', 
        high: '🟠',
        urgent: '🔴'
      };

      const typeEmoji = {
        general: '💬',
        suggestion: '💡',
        issue: '⚠️',
        compliment: '👏',
        feature_request: '⚙️'
      };

      const msg = {
        to: adminEmails,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'SWIFT Pool Management System'
        },
        subject: `New ${feedback.feedbackType.replace('_', ' ')} Feedback: ${feedback.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Feedback Received</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                  .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                  .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; color: #6b7280; }
                  .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                  .priority-low { background: #f3f4f6; color: #374151; }
                  .priority-medium { background: #dbeafe; color: #1e40af; }
                  .priority-high { background: #fed7aa; color: #ea580c; }
                  .priority-urgent { background: #fecaca; color: #dc2626; }
                  .feedback-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
                  .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
                  .btn:hover { background: #2563eb; }
                  .rating { color: #fbbf24; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1 style="margin: 0; font-size: 24px;">
                          ${typeEmoji[feedback.feedbackType] || '💬'} New Feedback Received
                      </h1>
                      <p style="margin: 10px 0 0 0; opacity: 0.9;">
                          A guest has submitted feedback that requires your attention
                      </p>
                  </div>
                  
                  <div class="content">
                      <div style="margin-bottom: 20px;">
                          <span class="priority-badge priority-${feedback.priority}">
                              ${priorityEmoji[feedback.priority]} ${feedback.priority.toUpperCase()} PRIORITY
                          </span>
                      </div>
                      
                      <h2 style="color: #1f2937; margin-bottom: 10px;">${feedback.title}</h2>
                      
                      <div class="feedback-details">
                          <p><strong>Type:</strong> ${feedback.feedbackType.replace('_', ' ').toUpperCase()}</p>
                          <p><strong>From:</strong> ${feedback.isAnonymous ? 'Anonymous Guest' : `${guest.fname} ${guest.lname} (${guest.email})`}</p>
                          ${pool ? `<p><strong>Related Pool:</strong> ${pool.name} - ${pool.location}</p>` : ''}
                          ${feedback.rating ? `<p><strong>Rating:</strong> <span class="rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5-feedback.rating)}</span> (${feedback.rating}/5)</p>` : ''}
                          <p><strong>Submitted:</strong> ${new Date(feedback.createdAt).toLocaleString()}</p>
                      </div>
                      
                      <h3 style="color: #1f2937;">Message:</h3>
                      <p style="background: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
                          ${feedback.description}
                      </p>
                      
                      <div style="text-align: center; margin-top: 30px;">
                          <a href="${process.env.FRONTEND_URL}/admin/feedback" class="btn">
                              View & Respond to Feedback
                          </a>
                      </div>
                  </div>
                  
                  <div class="footer">
                      <p style="margin: 0;">
                          This is an automated notification from SWIFT Pool Management System.<br>
                          Please respond to guest feedback promptly to maintain service quality.
                      </p>
                  </div>
              </div>
          </body>
          </html>
        `,
        text: `
New ${feedback.feedbackType.replace('_', ' ')} Feedback Received

Priority: ${feedback.priority.toUpperCase()}
Title: ${feedback.title}
From: ${feedback.isAnonymous ? 'Anonymous Guest' : `${guest.fname} ${guest.lname} (${guest.email})`}
${pool ? `Related Pool: ${pool.name} - ${pool.location}` : ''}
${feedback.rating ? `Rating: ${feedback.rating}/5 stars` : ''}
Submitted: ${new Date(feedback.createdAt).toLocaleString()}

Message:
${feedback.description}

Please log in to the admin dashboard to respond to this feedback.
        `
      };

      await sgMail.send(msg);
      console.log(`📧 Feedback notification sent to ${adminEmails.length} admin(s)`);
      
    } catch (error) {
      console.error('Error sending feedback notification email:', error);
      throw error;
    }
  }

  static async sendFeedbackResponseToGuest(responseData) {
    try {
      const { feedback, guest, adminResponse, adminName } = responseData;
      
      if (feedback.isAnonymous) {
        console.log('📧 Skipping email for anonymous feedback');
        return;
      }

      const statusEmoji = {
        under_review: '👀',
        in_progress: '⚠️',
        resolved: '✅',
        dismissed: '❌'
      };

      const msg = {
        to: guest.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'SWIFT Pool Management System'
        },
        subject: `Response to Your Feedback: ${feedback.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Feedback Response</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                  .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                  .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; color: #6b7280; }
                  .original-feedback { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280; }
                  .admin-response { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
                  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                  .status-resolved { background: #d1fae5; color: #065f46; }
                  .status-in_progress { background: #fed7aa; color: #ea580c; }
                  .status-under_review { background: #fef3c7; color: #92400e; }
                  .status-dismissed { background: #fecaca; color: #dc2626; }
                  .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
                  .btn:hover { background: #047857; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1 style="margin: 0; font-size: 24px;">
                          ${statusEmoji[feedback.status] || '✅'} Thank You for Your Feedback!
                      </h1>
                      <p style="margin: 10px 0 0 0; opacity: 0.9;">
                          We've responded to your feedback
                      </p>
                  </div>
                  
                  <div class="content">
                      <p>Dear ${guest.fname},</p>
                      
                      <p>Thank you for taking the time to share your feedback with us. We truly value your input and have carefully reviewed your submission.</p>
                      
                      <div style="margin-bottom: 20px;">
                          <span class="status-badge status-${feedback.status}">
                              Status: ${feedback.status.replace('_', ' ').toUpperCase()}
                          </span>
                      </div>
                      
                      <div class="original-feedback">
                          <h3 style="margin-top: 0; color: #374151;">Your Original Feedback:</h3>
                          <p><strong>${feedback.title}</strong></p>
                          <p>${feedback.description}</p>
                          <p style="font-size: 12px; color: #6b7280; margin-bottom: 0;">
                              Submitted on ${new Date(feedback.createdAt).toLocaleDateString()}
                          </p>
                      </div>
                      
                      <div class="admin-response">
                          <h3 style="margin-top: 0; color: #065f46;">Our Response:</h3>
                          <p>${adminResponse}</p>
                          <p style="font-size: 12px; color: #6b7280; margin-bottom: 0;">
                              - ${adminName}, SWIFT Admin Team
                          </p>
                      </div>
                      
                      <p>We hope our response addresses your concerns. If you have any additional questions or feedback, please don't hesitate to reach out to us.</p>
                      
                      <div style="text-align: center; margin-top: 30px;">
                          <a href="${process.env.FRONTEND_URL}/feedback" class="btn">
                              View Your Feedback History
                          </a>
                      </div>
                  </div>
                  
                  <div class="footer">
                      <p style="margin: 0;">
                          Thank you for helping us improve SWIFT Pool Management System.<br>
                          Your feedback makes a difference!
                      </p>
                  </div>
              </div>
          </body>
          </html>
        `,
        text: `
Thank You for Your Feedback!

Dear ${guest.fname},

Thank you for taking the time to share your feedback with us. We've responded to your submission.

Status: ${feedback.status.replace('_', ' ').toUpperCase()}

Your Original Feedback:
"${feedback.title}"
${feedback.description}
Submitted on ${new Date(feedback.createdAt).toLocaleDateString()}

Our Response:
${adminResponse}
- ${adminName}, SWIFT Admin Team

We hope our response addresses your concerns. If you have any additional questions or feedback, please don't hesitate to reach out to us.

Thank you for helping us improve SWIFT Pool Management System.
        `
      };

      await sgMail.send(msg);
      console.log(`📧 Response notification sent to ${guest.email}`);
      
    } catch (error) {
      console.error('Error sending response notification email:', error);
      throw error;
    }
  }

  static async sendFeedbackDigestToAdmins(adminEmails, digestData) {
    try {
      const { timeRange, stats, recentFeedback } = digestData;
      
      const msg = {
        to: adminEmails,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: 'SWIFT Pool Management System'
        },
        subject: `Weekly Feedback Digest - ${stats.totalFeedback} items need attention`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Feedback Digest</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                  .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                  .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; color: #6b7280; }
                  .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
                  .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
                  .stat-number { font-size: 24px; font-weight: bold; color: #1f2937; }
                  .stat-label { font-size: 12px; color: #6b7280; }
                  .feedback-item { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #3b82f6; }
                  .btn { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1 style="margin: 0; font-size: 24px;">📊 Weekly Feedback Digest</h1>
                      <p style="margin: 10px 0 0 0; opacity: 0.9;">
                          Your feedback summary for ${timeRange}
                      </p>
                  </div>
                  
                  <div class="content">
                      <div class="stats-grid">
                          <div class="stat-card">
                              <div class="stat-number">${stats.totalFeedback}</div>
                              <div class="stat-label">Total Feedback</div>
                          </div>
                          <div class="stat-card">
                              <div class="stat-number">${stats.pendingCount}</div>
                              <div class="stat-label">Pending Review</div>
                          </div>
                          <div class="stat-card">
                              <div class="stat-number">${stats.resolvedCount}</div>
                              <div class="stat-label">Resolved</div>
                          </div>
                          <div class="stat-card">
                              <div class="stat-number">${stats.averageRating || 'N/A'}</div>
                              <div class="stat-label">Avg Rating</div>
                          </div>
                      </div>
                      
                      ${stats.pendingCount > 0 ? `
                      <h3 style="color: #1f2937;">Recent Feedback Requiring Attention:</h3>
                      ${recentFeedback.map(feedback => `
                          <div class="feedback-item">
                              <h4 style="margin: 0 0 5px 0; color: #1f2937;">${feedback.title}</h4>
                              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">
                                  ${feedback.feedbackType.replace('_', ' ')} • ${feedback.priority} priority
                                  ${feedback.guest && !feedback.isAnonymous ? ` • by ${feedback.guest.fname} ${feedback.guest.lname}` : ' • Anonymous'}
                              </p>
                              <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">
                                  ${new Date(feedback.createdAt).toLocaleDateString()}
                              </p>
                          </div>
                      `).join('')}
                      ` : `
                      <div style="text-align: center; padding: 20px;">
                          <p style="color: #10b981; font-weight: bold;">🎉 All feedback has been addressed!</p>
                          <p style="color: #6b7280;">Great job keeping up with guest feedback.</p>
                      </div>
                      `}
                      
                      <div style="text-align: center; margin-top: 30px;">
                          <a href="${process.env.FRONTEND_URL}/admin/feedback" class="btn">
                              View Feedback Dashboard
                          </a>
                      </div>
                  </div>
                  
                  <div class="footer">
                      <p style="margin: 0;">
                          This is your weekly feedback digest from SWIFT Pool Management System.<br>
                          Stay on top of guest feedback to maintain excellent service quality.
                      </p>
                  </div>
              </div>
          </body>
          </html>
        `,
        text: `
Weekly Feedback Digest

Summary for ${timeRange}:
- Total Feedback: ${stats.totalFeedback}
- Pending Review: ${stats.pendingCount}
- Resolved: ${stats.resolvedCount}
- Average Rating: ${stats.averageRating || 'N/A'}

${stats.pendingCount > 0 ? `
Recent Feedback Requiring Attention:
${recentFeedback.map(feedback => `
- ${feedback.title}
  ${feedback.feedbackType.replace('_', ' ')} • ${feedback.priority} priority
  ${feedback.guest && !feedback.isAnonymous ? `by ${feedback.guest.fname} ${feedback.guest.lname}` : 'Anonymous'}
  ${new Date(feedback.createdAt).toLocaleDateString()}
`).join('')}
` : 'All feedback has been addressed!'}

Please log in to the admin dashboard to manage feedback.
        `
      };

      await sgMail.send(msg);
      console.log(`📧 Weekly digest sent to ${adminEmails.length} admin(s)`);
      
    } catch (error) {
      console.error('Error sending digest email:', error);
      throw error;
    }
  }

  // Get admin emails from database
  static async getAdminEmails() {
    try {
      const { User } = await import('../database/models/index.js');
      const admins = await User.findAll({
        where: { role: 'admin' },
        attributes: ['email']
      });
      return admins.map(admin => admin.email);
    } catch (error) {
      console.error('Error fetching admin emails:', error);
      return [];
    }
  }
}

export default EmailService;