// =================== MODEL DEFINITION ===================
// src/database/models/guestfeedback.js
"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class GuestFeedback extends Model {
    static associate(models) {
      GuestFeedback.belongsTo(models.User, { 
        foreignKey: "guestId", 
        as: "guest" 
      });
      GuestFeedback.belongsTo(models.User, { 
        foreignKey: "respondedBy", 
        as: "responder" 
      });
      GuestFeedback.belongsTo(models.Pool, { 
        foreignKey: "poolId", 
        as: "pool" 
      });
    }

    // Instance method to check if feedback is urgent
    isUrgent() {
      return this.priority === 'urgent' || this.priority === 'high';
    }

    // Instance method to check if feedback needs admin attention
    needsAttention() {
      return ['submitted', 'under_review'].includes(this.status);
    }
  }

  GuestFeedback.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      guestId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      poolId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      feedbackType: {
        type: DataTypes.ENUM('suggestion', 'issue', 'compliment', 'general', 'feature_request'),
        allowNull: false,
        defaultValue: 'general'
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        }
      },
      status: {
        type: DataTypes.ENUM('submitted', 'under_review', 'in_progress', 'resolved', 'dismissed'),
        allowNull: false,
        defaultValue: 'submitted'
      },
      adminResponse: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      respondedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      respondedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isAnonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "GuestFeedback",
      hooks: {
        beforeCreate: (feedback) => {
          feedback.id = uuidv4();
        },
      },
    }
  );

  return GuestFeedback;
};