// =================== GUEST FEEDBACK SYSTEM - BACKEND ===================

// 1. DATABASE MIGRATION - Create Feedback Table
// src/database/migrations/20241225000002-create-guest-feedback.js
"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("GuestFeedback", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      guestId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      poolId: {
        type: Sequelize.UUID,
        allowNull: true, // Can be null for general feedback
        references: {
          model: 'Pools',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      feedbackType: {
        type: Sequelize.ENUM('suggestion', 'issue', 'compliment', 'general', 'feature_request'),
        allowNull: false,
        defaultValue: 'general'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      status: {
        type: Sequelize.ENUM('submitted', 'under_review', 'in_progress', 'resolved', 'dismissed'),
        allowNull: false,
        defaultValue: 'submitted'
      },
      adminResponse: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      respondedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      respondedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isAnonymous: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      attachments: {
        type: Sequelize.JSON, // Store file paths/URLs
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('GuestFeedback', ['guestId']);
    await queryInterface.addIndex('GuestFeedback', ['poolId']);
    await queryInterface.addIndex('GuestFeedback', ['status']);
    await queryInterface.addIndex('GuestFeedback', ['feedbackType']);
    await queryInterface.addIndex('GuestFeedback', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("GuestFeedback");
  },
};