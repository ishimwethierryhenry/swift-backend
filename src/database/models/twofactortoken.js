"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

module.exports = (sequelize, DataTypes) => {
  class TwoFactorToken extends Model {
    static associate(models) {
      TwoFactorToken.belongsTo(models.User, { 
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

    // Static method to generate random 6-digit token
    static generateSixDigitToken() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Static method to generate backup code
    static generateBackupCode() {
      return crypto.randomBytes(4).toString('hex').toUpperCase();
    }
  }

  TwoFactorToken.init(
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
      },
      tokenType: {
        type: DataTypes.ENUM('setup', 'verification', 'backup'),
        allowNull: false,
        defaultValue: 'verification'
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
      deviceFingerprint: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "TwoFactorToken",
      hooks: {
        beforeCreate: (token) => {
          token.id = uuidv4();
        },
      },
    }
  );

  return TwoFactorToken;
};