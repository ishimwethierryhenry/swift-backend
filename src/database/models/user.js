// src/database/models/user.js - UPDATED WITH SECURITY FIELDS
"use strict";

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Pool, { foreignKey: "assigned_to" });
      
      // ✅ ADD SECURITY ASSOCIATIONS
      User.hasMany(models.PasswordResetToken, { 
        foreignKey: "userId", 
        as: "passwordResetTokens" 
      });
      
      User.hasMany(models.TwoFactorToken, { 
        foreignKey: "userId", 
        as: "twoFactorTokens" 
      });
      
      User.hasMany(models.GuestFeedback, { 
        foreignKey: "guestId", 
        as: "submittedFeedback" 
      });
      
      User.hasMany(models.GuestFeedback, { 
        foreignKey: "respondedBy", 
        as: "respondedFeedback" 
      });
      
      User.hasMany(models.WaterQualityData, { 
        foreignKey: "recordedBy", 
        as: "waterQualityRecords" 
      });
    }

    async checkPassword(password) {
      const match = await bcrypt.compare(password, this.pwd);
      return match;
    }

    // ✅ SECURITY HELPER METHODS
    isAccountLocked() {
      return this.lockedUntil && new Date() < this.lockedUntil;
    }

    getRemainingLockTime() {
      if (!this.isAccountLocked()) return 0;
      return Math.ceil((this.lockedUntil - new Date()) / (1000 * 60)); // minutes
    }

    needsPasswordChange() {
      return this.isFirstLogin;
    }

    has2FAEnabled() {
      return this.twoFactorEnabled;
    }

    getTrustedDevicesCount() {
      return this.trustedDevices ? this.trustedDevices.length : 0;
    }

    getBackupCodesCount() {
      return this.backupCodes ? this.backupCodes.length : 0;
    }
  }
  
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fname: DataTypes.STRING,
      lname: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      location: DataTypes.STRING,
      pwd: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM('admin', 'operator', 'overseer', 'guest'),
        defaultValue: 'operator',
        validate: {
          isIn: [['admin', 'operator', 'overseer', 'guest']]
        }
      },
      gender: DataTypes.STRING,
      
      // ✅ SECURITY FIELDS
      isFirstLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lockedUntil: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      twoFactorSecret: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      backupCodes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      trustedDevices: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      securityNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  User.beforeCreate((user) => {
    user.id = uuidv4();
  });
  
  return User;
};