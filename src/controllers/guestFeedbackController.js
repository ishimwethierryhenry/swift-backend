// =================== UPDATED FEEDBACK CONTROLLER WITH PROPER IMPORTS ===================
// src/controllers/guestFeedbackController.js - Complete working version

import { GuestFeedback, User, Pool, sequelize } from "../database/models";
import { Op } from "sequelize";
import feedbackSchema from "../validations/feedbackSchema";
import EmailService from "../services/emailService";

class GuestFeedbackController {
  // Submit feedback (guests only) - Updated with email notification
  static async submitFeedback(req, res) {
    try {
      const { error } = feedbackSchema.validate(req.body);
      if (error) {
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

      // Verify user is a guest
      if (req.user.role !== 'guest') { 
        return res.status(403).json({
          message: "Only guests can submit feedback through this endpoint"
        });
      }

      // If poolId provided, verify pool exists
      let pool = null;
      if (poolId) {
        pool = await Pool.findByPk(poolId);
        if (!pool) {
          return res.status(404).json({ message: "Pool not found" });
        }
      }

      const newFeedback = await GuestFeedback.create({
        guestId: req.user.id, 
        poolId: poolId || null,
        feedbackType,
        priority,
        title,
        description,
        rating: rating || null,
        isAnonymous: isAnonymous || false,
      });

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

      console.log(`📝 New feedback submitted by guest: ${req.user.fname} ${req.user.lname}`);
      console.log(`📋 Type: ${feedbackType}, Priority: ${priority}`);

      // Send email notification to admins (don't wait for it)
      setImmediate(async () => {
        try {
          const adminEmails = await EmailService.getAdminEmails();
          if (adminEmails.length > 0) {
            await EmailService.sendFeedbackNotificationToAdmin({
              feedback: feedbackWithDetails,
              guest: feedbackWithDetails.guest,
              pool: feedbackWithDetails.pool
            }, adminEmails);
          }
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the main request if email fails
        }
      });

      return res.status(201).json({
        status: "Success",
        message: "Feedback submitted successfully! An admin will review it soon.",
        data: feedbackWithDetails,
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: error.message 
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
      console.error("Error getting feedback:", error);
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

      // Get counts by status
      const statusCounts = await GuestFeedback.findAll({
        where: whereClause,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Get counts by type
      const typeCounts = await GuestFeedback.findAll({
        where: whereClause,
        attributes: [
          'feedbackType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['feedbackType'],
        raw: true
      });

      // Get counts by priority
      const priorityCounts = await GuestFeedback.findAll({
        where: whereClause,
        attributes: [
          'priority',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['priority'],
        raw: true
      });

      // Get average rating
      const avgRating = await GuestFeedback.findOne({
        where: {
          ...whereClause,
          rating: { [Op.not]: null }
        },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
          [sequelize.fn('COUNT', sequelize.col('rating')), 'ratedCount']
        ],
        raw: true
      });

      // Get pending count (needs attention)
      const pendingCount = await GuestFeedback.count({
        where: {
          ...whereClause,
          status: {
            [Op.in]: ['submitted', 'under_review']
          }
        }
      });

      return res.status(200).json({
        status: "success",
        statistics: {
          timeRange,
          statusCounts,
          typeCounts,
          priorityCounts,
          averageRating: avgRating.averageRating ? parseFloat(avgRating.averageRating).toFixed(1) : null,
          ratedFeedbackCount: parseInt(avgRating.ratedCount) || 0,
          pendingCount
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

  // Respond to feedback (admins only) - Updated with email notification
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

      // Update feedback with admin response
      feedback.adminResponse = adminResponse;
      feedback.status = status;
      feedback.respondedBy = req.user.user.id;
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

      console.log(`✅ Feedback ${feedbackId} responded to by admin: ${req.user.user.fname} ${req.user.user.lname}`);

      // Send email notification to guest (don't wait for it)
      setImmediate(async () => {
        try {
          if (!feedback.isAnonymous && feedback.guest?.email) {
            await EmailService.sendFeedbackResponseToGuest({
              feedback: updatedFeedback,
              guest: feedback.guest,
              adminResponse,
              adminName: `${req.user.user.fname} ${req.user.user.lname}`
            });
          }
        } catch (emailError) {
          console.error('Failed to send response email:', emailError);
          // Don't fail the main request if email fails
        }
      });

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

  // Get guest's own feedback
  static async getMyFeedback(req, res) {
    try {
      const guestId = req.user.id;

      const feedback = await GuestFeedback.findAll({
        where: { guestId },
        include: [
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
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        status: "success",
        data: feedback
      });
    } catch (error) {
      console.error("Error getting user feedback:", error);
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