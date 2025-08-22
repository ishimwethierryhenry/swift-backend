// src/services/tokenService.js
import crypto from 'crypto';
import { PasswordResetToken, TwoFactorToken } from '../database/models';

class TokenService {
  // Generate password reset token
  static async generatePasswordResetToken(userId, ipAddress, userAgent) {
    try {
      // Invalidate any existing tokens for this user
      await PasswordResetToken.invalidateUserTokens(userId);

      // Generate secure token
      const token = PasswordResetToken.generateToken();
      const tokenHash = PasswordResetToken.hashToken(token);

      // Set expiry to 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Create token record
      const resetToken = await PasswordResetToken.create({
        userId,
        token,
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      });

      console.log(`🔐 Password reset token generated for user ${userId}`);
      return { token, expiresAt };

    } catch (error) {
      console.error('Error generating password reset token:', error);
      throw new Error('Failed to generate password reset token');
    }
  }

  // Verify password reset token
  static async verifyPasswordResetToken(token) {
    try {
      const tokenHash = PasswordResetToken.hashToken(token);
      
      const resetToken = await PasswordResetToken.findOne({
        where: { 
          tokenHash,
          isUsed: false 
        },
        include: [{
          model: require('../database/models').User,
          as: 'user',
          attributes: ['id', 'email', 'fname', 'lname']
        }]
      });

      if (!resetToken) {
        return { valid: false, error: 'Invalid token' };
      }

      if (resetToken.isExpired()) {
        return { valid: false, error: 'Token has expired' };
      }

      return { valid: true, resetToken };

    } catch (error) {
      console.error('Error verifying password reset token:', error);
      return { valid: false, error: 'Token verification failed' };
    }
  }

  // Mark password reset token as used
  static async markPasswordResetTokenAsUsed(token) {
    try {
      const tokenHash = PasswordResetToken.hashToken(token);
      
      await PasswordResetToken.update(
        { isUsed: true, usedAt: new Date() },
        { where: { tokenHash } }
      );

      console.log(`✅ Password reset token marked as used`);
      return true;

    } catch (error) {
      console.error('Error marking token as used:', error);
      return false;
    }
  }

  // Generate 2FA verification token
  static async generate2FAToken(userId, tokenType = 'verification', ipAddress, userAgent, deviceFingerprint) {
    try {
      // Invalidate any existing tokens of the same type for this user
      await TwoFactorToken.invalidateUserTokens(userId, tokenType);

      // Generate token based on type
      let token;
      let expiresAt;

      switch (tokenType) {
        case 'setup':
          token = TwoFactorToken.generateSixDigitToken();
          expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for setup
          break;
        case 'verification':
          token = TwoFactorToken.generateSixDigitToken();
          expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes for verification
          break;
        case 'backup':
          token = TwoFactorToken.generateBackupCode();
          expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for backup
          break;
        default:
          throw new Error('Invalid token type');
      }

      // Create token record
      const twoFactorToken = await TwoFactorToken.create({
        userId,
        token,
        tokenType,
        expiresAt,
        ipAddress,
        userAgent,
        deviceFingerprint,
      });

      console.log(`🔐 2FA ${tokenType} token generated for user ${userId}`);
      return { token, expiresAt, tokenType };

    } catch (error) {
      console.error('Error generating 2FA token:', error);
      throw new Error('Failed to generate 2FA token');
    }
  }

  // Verify 2FA token
  static async verify2FAToken(userId, token, tokenType = 'verification') {
    try {
      const twoFactorToken = await TwoFactorToken.findOne({
        where: { 
          userId,
          token,
          tokenType,
          isUsed: false 
        },
        include: [{
          model: require('../database/models').User,
          as: 'user',
          attributes: ['id', 'email', 'fname', 'lname']
        }]
      });

      if (!twoFactorToken) {
        return { valid: false, error: 'Invalid token' };
      }

      if (twoFactorToken.isExpired()) {
        return { valid: false, error: 'Token has expired' };
      }

      return { valid: true, twoFactorToken };

    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      return { valid: false, error: 'Token verification failed' };
    }
  }

  // Mark 2FA token as used
  static async mark2FATokenAsUsed(userId, token, tokenType = 'verification') {
    try {
      await TwoFactorToken.update(
        { isUsed: true, usedAt: new Date() },
        { where: { userId, token, tokenType } }
      );

      console.log(`✅ 2FA ${tokenType} token marked as used for user ${userId}`);
      return true;

    } catch (error) {
      console.error('Error marking 2FA token as used:', error);
      return false;
    }
  }

  // Generate backup codes for 2FA
  static generateBackupCodes(count = 10) {
    return TwoFactorToken.generateBackupCodes(count);
  }

  // Clean up expired tokens (run periodically)
  static async cleanupExpiredTokens() {
    try {
      const passwordTokensCleared = await PasswordResetToken.cleanupExpired();
      const twoFactorTokensCleared = await TwoFactorToken.cleanupExpired();
      
      console.log(`🧹 Token cleanup completed: ${passwordTokensCleared} password tokens, ${twoFactorTokensCleared} 2FA tokens`);
      
      return {
        passwordTokensCleared,
        twoFactorTokensCleared,
        total: passwordTokensCleared + twoFactorTokensCleared
      };
    } catch (error) {
      console.error('Error during token cleanup:', error);
      throw error;
    }
  }

  // Validate token format
  static validateTokenFormat(token, type = 'password') {
    if (!token || typeof token !== 'string') {
      return false;
    }

    switch (type) {
      case 'password':
        // Password reset tokens are 64 characters hex
        return /^[a-f0-9]{64}$/i.test(token);
      case '2fa':
        // 2FA tokens are 6 digits
        return /^\d{6}$/.test(token);
      case 'backup':
        // Backup codes are 8 characters hex (uppercase)
        return /^[A-F0-9]{8}$/.test(token);
      default:
        return false;
    }
  }

  // Get token statistics
  static async getTokenStatistics() {
    try {
      const passwordTokenStats = await PasswordResetToken.findAll({
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN "isUsed" = false THEN 1 END')), 'active'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN "expiresAt" < NOW() THEN 1 END')), 'expired']
        ],
        raw: true
      });

      const twoFactorTokenStats = await TwoFactorToken.findAll({
        attributes: [
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN "isUsed" = false THEN 1 END')), 'active'],
          [require('sequelize').fn('COUNT', require('sequelize').literal('CASE WHEN "expiresAt" < NOW() THEN 1 END')), 'expired']
        ],
        raw: true
      });

      return {
        passwordResetTokens: passwordTokenStats[0],
        twoFactorTokens: twoFactorTokenStats[0]
      };
    } catch (error) {
      console.error('Error getting token statistics:', error);
      throw error;
    }
  }
}

export default TokenService;