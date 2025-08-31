// src/controllers/guestFeedbackController.js - FULLY FIXED VERSION
import { GuestFeedback, User, Pool, sequelize } from "../database/models";
import { Op } from "sequelize";
import feedbackSchema from "../validations/feedbackSchema";
import EmailService from "../services/emailService";

class GuestFeedbackController {
  // Submit feedback (guests only) - FIXED user access
  static async submitFeedback(req, res) {
    try {
      console.log('🚀 SubmitFeedback called');
      console.log('📨 Request body:', req.body);
      console.log('👤 Request user:', req.user);
      
      // Validate request body
      const { error } = feedbackSchema.validate(req.body);
      if (error) {
        console.log('❌ Validation error:', error.details[0].message);
        return res.status(400).json({ 
          validationError: error.details[0].message 
        });
      }

      const { 
        poolId, 
        feedbackType, 
        priority, 
        title, 
        description, 
        rating, 
        isAnonymous 
      } = req.body;

      // 🔥 CRITICAL FIX: Standardized user access pattern
      const userId = req.user?.id || req.user?.user?.id;
      const userRole = req.user?.role || req.user?.user?.role;
      const userFname = req.user?.fname || req.user?.user?.fname;
      const userLname = req.user?.lname || req.user?.user?.lname;

      console.log('🔍 Extracted user info:', {
        userId,
        userRole,
        userName: `${userFname} ${userLname}`,
        hasUser: !!req.user
      });

      if (!userId) {
        console.log('❌ No user ID found');
        return res.status(401).json({
          message: "User authentication failed - no user ID found"
        });
      }

      // Verify user is a guest
      if (userRole !== 'guest') { 
        console.log('❌ User is not a guest:', userRole);
        return res.status(403).json({
          message: "Only guests can submit feedback through this endpoint"
        });
      }

      // If poolId provided, verify pool exists
      let pool = null;
      if (poolId) {
        console.log('🏊 Looking for pool:', poolId);
        pool = await Pool.findByPk(poolId);
        if (!pool) {
          console.log('❌ Pool not found:', poolId);
          return res.status(404).json({ message: "Pool not found" });
        }
        console.log('✅ Pool found:', pool.name);
      }

      console.log('💾 Creating feedback with data:', {
        guestId: userId,
        poolId: poolId || null,
        feedbackType,
        priority,
        title,
        description,
        rating: rating || null,
        isAnonymous: isAnonymous || false
      });

      // Create feedback
      const newFeedback = await GuestFeedback.create({
        guestId: userId,
        poolId: poolId || null,
        feedbackType,
        priority,
        title,
        description,
        rating: rating || null,
        isAnonymous: isAnonymous || false,
      });

      console.log('✅ Feedback created with ID:', newFeedback.id);

      // Get the feedback with associations for response
      const feedbackWithDetails = await GuestFeedback.findByPk(newFeedback.id, {
        include: [
          {
            model: User,
            as: 'guest',
            attributes: ['id', 'fname', 'lname', 'email']
          },
          {
            model: Pool,
            as: 'pool',
            attributes: ['id', 'name', 'location']
          }
        ]
      });

      console.log('📧 Feedback with details:', feedbackWithDetails?.id);

      // Send email notification (async, don't wait)
      setImmediate(async () => {
        try {
          if (EmailService && typeof EmailService.getAdminEmails === 'function') {
            const adminEmails = await EmailService.getAdminEmails();
            if (adminEmails && adminEmails.length > 0) {
              await EmailService.sendFeedbackNotificationToAdmin({
                feedback: feedbackWithDetails,
                guest: feedbackWithDetails.guest,
                pool: feedbackWithDetails.pool
              }, adminEmails);
            }
          }
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      });

      return res.status(201).json({
        status: "Success",
        message: "Feedback submitted successfully! An admin will review it soon.",
        data: feedbackWithDetails,
      });
    } catch (error) {
      console.error("💥 Error submitting feedback:", error);
      console.error("Stack trace:", error.stack);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  // Get guest's own feedback - FIXED with comprehensive debugging
  static async getMyFeedback(req, res) {
    try {
      console.log('🔍 GET MY FEEDBACK - Starting...');
      console.log('📨 Full request user object:', JSON.stringify(req.user, null, 2));
      
      // 🔥 CRITICAL FIX: Standardized user access
      const userId = req.user?.id || req.user?.user?.id;
      const userRole = req.user?.role || req.user?.user?.role;
      
      console.log('🔍 Extracted info:', {
        userId,
        userRole,
        userType: typeof userId,
        hasUser: !!req.user
      });

      if (!userId) {
        console.log('❌ No user ID extracted from token');
        return res.status(401).json({
          message: "Authentication failed - no user ID found"
        });
      }

      // Debug: Check what's in the database
      const allFeedbackDebug = await GuestFeedback.findAll({
        attributes: ['id', 'guestId', 'title', 'createdAt'],
        raw: true
      });
      console.log('🗄️ All feedback in DB:', allFeedbackDebug);
      console.log('🔍 Looking for guestId:', userId, 'Type:', typeof userId);

      // Query for user's feedback with explicit debugging
      const feedback = await GuestFeedback.findAll({
        where: { 
          guestId: userId.toString() // Ensure string comparison
        },
        include: [
          {
            model: User,
            as: 'responder',
            attributes: ['id', 'fname', 'lname'],
            required: false
          },
          {
            model: Pool,
            as: 'pool',
            attributes: ['id', 'name', 'location'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      console.log('✅ Found feedback count:', feedback.length);
      console.log('📄 Feedback details:', feedback.map(f => ({
        id: f.id,
        guestId: f.guestId,
        title: f.title,
        status: f.status,
        createdAt: f.createdAt
      })));

      return res.status(200).json({
        status: "success",
        data: feedback,
        debug: {
          userId,
          userRole,
          feedbackCount: feedback.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("💥 Error getting user feedback:", error);
      console.error("Stack trace:", error.stack);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message,
        debug: {
          userId: req.user?.id || req.user?.user?.id,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  // Get all feedback for admins
  static async getAllFeedback(req, res) {
    try {
      const { 
        status = 'all',
        feedbackType = 'all',
        priority = 'all',
        limit = 50,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      let whereClause = {};

      // Apply filters
      if (status !== 'all') {
        whereClause.status = status;
      }
      if (feedbackType !== 'all') {
        whereClause.feedbackType = feedbackType;
      }
      if (priority !== 'all') {
        whereClause.priority = priority;
      }

      const feedback = await GuestFeedback.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'guest',
            attributes: ['id', 'fname', 'lname', 'email', 'location']
          },
          {
            model: User,
            as: 'responder',
            attributes: ['id', 'fname', 'lname']
          },
          {
            model: Pool,
            as: 'pool',
            attributes: ['id', 'name', 'location']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return res.status(200).json({
        status: "success",
        data: feedback.rows,
        pagination: {
          total: feedback.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(feedback.count / limit)
        }
      });
    } catch (error) {
      console.error("Error getting all feedback:", error);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  // Get feedback statistics for admin dashboard
  static async getFeedbackStats(req, res) {
    try {
      const { timeRange = 'month' } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }

      const whereClause = {
        createdAt: {
          [Op.gte]: startDate
        }
      };

      // Get comprehensive stats
      const [totalFeedback, pendingFeedback, resolvedFeedback, avgRatingResult] = await Promise.all([
        GuestFeedback.count({ where: whereClause }),
        GuestFeedback.count({ 
          where: { 
            ...whereClause, 
            status: { [Op.in]: ['submitted', 'under_review'] }
          }
        }),
        GuestFeedback.count({ 
          where: { 
            ...whereClause, 
            status: 'resolved'
          }
        }),
        GuestFeedback.findOne({
          where: {
            ...whereClause,
            rating: { [Op.not]: null }
          },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
            [sequelize.fn('COUNT', sequelize.col('rating')), 'ratedCount']
          ],
          raw: true
        })
      ]);

      return res.status(200).json({
        status: "success",
        statistics: {
          timeRange,
          totalFeedback,
          pendingFeedback,
          resolvedFeedback,
          averageRating: avgRatingResult.averageRating ? parseFloat(avgRatingResult.averageRating).toFixed(1) : null,
          ratedFeedbackCount: parseInt(avgRatingResult.ratedCount) || 0,
          responseRate: totalFeedback > 0 ? ((resolvedFeedback / totalFeedback) * 100).toFixed(1) : 0,
          weeklyTrend: 0 // Calculate this based on your needs
        }
      });
    } catch (error) {
      console.error("Error getting feedback stats:", error);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  // Respond to feedback (admins only) - FIXED user access
  static async respondToFeedback(req, res) {
    try {
      const { feedbackId } = req.params;
      const { adminResponse, status } = req.body;

      if (!adminResponse || !status) {
        return res.status(400).json({
          message: "Admin response and status are required"
        });
      }

      const feedback = await GuestFeedback.findByPk(feedbackId, {
        include: [
          {
            model: User,
            as: 'guest',
            attributes: ['id', 'fname', 'lname', 'email']
          }
        ]
      });

      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }

      // 🔥 FIXED: Consistent user access pattern
      const adminUserId = req.user?.id || req.user?.user?.id;
      const adminFname = req.user?.fname || req.user?.user?.fname;
      const adminLname = req.user?.lname || req.user?.user?.lname;

      // Update feedback with admin response
      feedback.adminResponse = adminResponse;
      feedback.status = status;
      feedback.respondedBy = adminUserId;
      feedback.respondedAt = new Date();

      await feedback.save();

      // Get updated feedback with all associations
      const updatedFeedback = await GuestFeedback.findByPk(feedbackId, {
        include: [
          {
            model: User,
            as: 'guest',
            attributes: ['id', 'fname', 'lname', 'email']
          },
          {
            model: User,
            as: 'responder',
            attributes: ['id', 'fname', 'lname']
          },
          {
            model: Pool,
            as: 'pool',
            attributes: ['id', 'name', 'location']
          }
        ]
      });

      console.log(`Feedback ${feedbackId} responded to by admin: ${adminFname} ${adminLname}`);

      return res.status(200).json({
        status: "success",
        message: "Response sent successfully",
        data: updatedFeedback
      });
    } catch (error) {
      console.error("Error responding to feedback:", error);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }

  // Update feedback status (admin only)
  static async updateFeedbackStatus(req, res) {
    try {
      const { feedbackId } = req.params;
      const { status } = req.body;

      const validStatuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'dismissed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Valid statuses: " + validStatuses.join(', ')
        });
      }

      const feedback = await GuestFeedback.findByPk(feedbackId);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }

      feedback.status = status;
      await feedback.save();

      return res.status(200).json({
        status: "success",
        message: "Feedback status updated successfully",
        data: feedback
      });
    } catch (error) {
      console.error("Error updating feedback status:", error);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
      });
    }
  }
}

export default GuestFeedbackController;