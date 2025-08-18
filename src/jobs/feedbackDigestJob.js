// =================== WEEKLY DIGEST CRON JOB ===================
// src/jobs/feedbackDigestJob.js
import cron from 'node-cron';
import { GuestFeedback, User, Pool, sequelize } from '../database/models';
import { Op } from 'sequelize';
import EmailService from '../services/emailService';

class FeedbackDigestJob {
  static init() {
    // Run every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('📊 Running weekly feedback digest job...');
      await this.sendWeeklyDigest();
    });

    // Run every day at 9:00 AM for urgent feedback
    cron.schedule('0 9 * * *', async () => {
      console.log('🚨 Checking for urgent feedback...');
      await this.checkUrgentFeedback();
    });
  }

  static async sendWeeklyDigest() {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Get weekly stats
      const weeklyFeedback = await GuestFeedback.findAll({
        where: {
          createdAt: {
            [Op.gte]: oneWeekAgo
          }
        },
        include: [
          {
            model: User,
            as: 'guest',
            attributes: ['fname', 'lname']
          }
        ]
      });

      const stats = {
        totalFeedback: weeklyFeedback.length,
        pendingCount: weeklyFeedback.filter(f => ['submitted', 'under_review'].includes(f.status)).length,
        resolvedCount: weeklyFeedback.filter(f => f.status === 'resolved').length,
        averageRating: weeklyFeedback.filter(f => f.rating).reduce((sum, f) => sum + f.rating, 0) / weeklyFeedback.filter(f => f.rating).length || null
      };

      if (stats.averageRating) {
        stats.averageRating = stats.averageRating.toFixed(1);
      }

      const recentFeedback = weeklyFeedback
        .filter(f => ['submitted', 'under_review'].includes(f.status))
        .slice(0, 5);

      const adminEmails = await EmailService.getAdminEmails();
      
      if (adminEmails.length > 0 && stats.totalFeedback > 0) {
        await EmailService.sendFeedbackDigestToAdmins(adminEmails, {
          timeRange: 'past week',
          stats,
          recentFeedback
        });
      }

      console.log(`📧 Weekly digest sent for ${stats.totalFeedback} feedback items`);
    } catch (error) {
      console.error('Error sending weekly digest:', error);
    }
  }

  static async checkUrgentFeedback() {
    try {
      const urgentFeedback = await GuestFeedback.findAll({
        where: {
          priority: 'urgent',
          status: {
            [Op.in]: ['submitted', 'under_review']
          },
          createdAt: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: [
          {
            model: User,
            as: 'guest',
            attributes: ['fname', 'lname', 'email']
          },
          {
            model: Pool,
            as: 'pool',
            attributes: ['name', 'location']
          }
        ]
      });

      if (urgentFeedback.length > 0) {
        const adminEmails = await EmailService.getAdminEmails();
        
        for (const feedback of urgentFeedback) {
          await EmailService.sendFeedbackNotificationToAdmin({
            feedback,
            guest: feedback.guest,
            pool: feedback.pool
          }, adminEmails);
        }

        console.log(`🚨 Sent urgent notifications for ${urgentFeedback.length} feedback items`);
      }
    } catch (error) {
      console.error('Error checking urgent feedback:', error);
    }
  }
}

export default FeedbackDigestJob;