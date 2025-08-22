// src/database/models/passwordresettoken.js
"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

module.exports = (sequelize, DataTypes) => {
  class PasswordResetToken extends Model {
    static associate(models) {
      PasswordResetToken.belongsTo(models.User, { 
        foreignKey: "userId", 
        as: "user" 
      });
    }

    // Instance method to check if token is expired
    isExpired() {
      return new Date() > this.expiresAt;
    }

    // Instance method to check if token is valid
    isValid() {
      return !this.isUsed && !this.isExpired();
    }

    // Static method to generate secure token
    static generateToken() {
      return crypto.randomBytes(32).toString('hex');
    }

    // Static method to hash token
    static hashToken(token) {
      return crypto.createHash('sha256').update(token).digest('hex');
    }

    // Static method to clean up expired tokens
    static async cleanupExpired() {
      const expiredTokens = await this.destroy({
        where: {
          expiresAt: {
            [sequelize.Sequelize.Op.lt]: new Date()
          }
        }
      });
      console.log(`🧹 Cleaned up ${expiredTokens} expired password reset tokens`);
      return expiredTokens;
    }

    // Static method to invalidate all tokens for a user
    static async invalidateUserTokens(userId) {
      await this.update(
        { isUsed: true, usedAt: new Date() },
        { where: { userId, isUsed: false } }
      );
    }
  }

  PasswordResetToken.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      tokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PasswordResetToken",
      hooks: {
        beforeCreate: (token) => {
          token.id = uuidv4();
        },
      },
    }
  );

  return PasswordResetToken;
};