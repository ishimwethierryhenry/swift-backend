// src/services/twoFactorService.js
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { User, TwoFactorToken } from '../database/models';

class TwoFactorService {
  // Generate 2FA secret for user
  static generateSecret(email, issuer = 'SWIFT Pool Management') {
    const secret = speakeasy.generateSecret({
      name: email,
      issuer: issuer,
      length: 32
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    };
  }

  // Generate QR code for 2FA setup
  static async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify TOTP token
  static verifyTOTP(token, secret, window = 1) {
    try {
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: window, // Allow 30 seconds before/after
      });
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      return false;
    }
  }

  // Setup 2FA for user
  static async setupTwoFactor(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.twoFactorEnabled) {
        throw new Error('2FA is already enabled for this user');
      }

      // Generate secret
      const { secret, otpauthUrl } = this.generateSecret(user.email);
      
      // Generate QR code
      const qrCode = await this.generateQRCode(otpauthUrl);

      // Store temporary secret (not yet enabled)
      await user.update({ twoFactorSecret: secret });

      console.log(`🔐 2FA setup initiated for user ${userId}`);

      return {
        secret,
        qrCode,
        manualEntryKey: secret,
        issuer: 'SWIFT Pool Management',
        accountName: user.email
      };

    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error;
    }
  }

  // Verify and enable 2FA
  static async verifyAndEnable2FA(userId, token) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.twoFactorSecret) {
        throw new Error('2FA setup not initiated');
      }

      // Verify the TOTP token
      const isValid = this.verifyTOTP(token, user.twoFactorSecret);
      
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Enable 2FA
      await user.update({
        twoFactorEnabled: true,
        backupCodes: backupCodes.map(code => crypto.createHash('sha256').update(code).digest('hex'))
      });

      console.log(`✅ 2FA enabled for user ${userId}`);

      return {
        success: true,
        backupCodes // Return unhashed codes to user
      };

    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw error;
    }
  }

  // Verify 2FA during login
  static async verifyLogin2FA(userId, token, isBackupCode = false) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.twoFactorEnabled) {
        throw new Error('2FA is not enabled for this user');
      }

      if (isBackupCode) {
        return this.verifyBackupCode(user, token);
      } else {
        return this.verifyTOTP(token, user.twoFactorSecret);
      }

    } catch (error) {
      console.error('Error verifying login 2FA:', error);
      throw error;
    }
  }

  // Verify backup code
  static verifyBackupCode(user, code) {
    try {
      if (!user.backupCodes || !Array.isArray(user.backupCodes)) {
        return false;
      }

      const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
      const codeIndex = user.backupCodes.indexOf(hashedCode);

      if (codeIndex === -1) {
        return false;
      }

      // Remove used backup code
      const updatedBackupCodes = [...user.backupCodes];
      updatedBackupCodes.splice(codeIndex, 1);

      // Update user with remaining backup codes
      user.update({ backupCodes: updatedBackupCodes });

      console.log(`🔐 Backup code used for user ${user.id}. ${updatedBackupCodes.length} codes remaining.`);
      
      return true;

    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  }

  // Generate backup codes
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Regenerate backup codes
  static async regenerateBackupCodes(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.twoFactorEnabled) {
        throw new Error('2FA is not enabled for this user');
      }

      const newBackupCodes = this.generateBackupCodes();
      
      await user.update({
        backupCodes: newBackupCodes.map(code => crypto.createHash('sha256').update(code).digest('hex'))
      });

      console.log(`🔄 Backup codes regenerated for user ${userId}`);

      return newBackupCodes;

    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      throw error;
    }
  }

  // Disable 2FA
  static async disable2FA(userId, password) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify password before disabling
      const isPasswordValid = await user.checkPassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Disable 2FA
      await user.update({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null
      });

      // Invalidate any pending 2FA tokens
      await TwoFactorToken.invalidateUserTokens(userId);

      console.log(`❌ 2FA disabled for user ${userId}`);

      return { success: true };

    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }

  // Get 2FA status
  static async get2FAStatus(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'twoFactorEnabled', 'backupCodes']
      });

      if (!user) {
        throw new Error('User not found');
      }

      const backupCodesCount = user.backupCodes ? user.backupCodes.length : 0;

      return {
        enabled: user.twoFactorEnabled,
        backupCodesRemaining: backupCodesCount,
        hasSecret: !!user.twoFactorSecret
      };

    } catch (error) {
      console.error('Error getting 2FA status:', error);
      throw error;
    }
  }

  // Add trusted device
  static async addTrustedDevice(userId, deviceFingerprint, deviceInfo) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const trustedDevices = user.trustedDevices || [];
      
      // Check if device already trusted
      const existingDevice = trustedDevices.find(device => device.fingerprint === deviceFingerprint);
      if (existingDevice) {
        return { success: true, message: 'Device already trusted' };
      }

      // Add new trusted device
      const newDevice = {
        fingerprint: deviceFingerprint,
        name: deviceInfo.name || 'Unknown Device',
        userAgent: deviceInfo.userAgent,
        addedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };

      trustedDevices.push(newDevice);

      // Keep only last 5 trusted devices
      if (trustedDevices.length > 5) {
        trustedDevices.splice(0, trustedDevices.length - 5);
      }

      await user.update({ trustedDevices });

      console.log(`📱 New trusted device added for user ${userId}`);

      return { success: true, device: newDevice };

    } catch (error) {
      console.error('Error adding trusted device:', error);
      throw error;
    }
  }

  // Check if device is trusted
  static async isDeviceTrusted(userId, deviceFingerprint) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['trustedDevices']
      });

      if (!user || !user.trustedDevices) {
        return false;
      }

      const trustedDevice = user.trustedDevices.find(device => device.fingerprint === deviceFingerprint);
      
      if (trustedDevice) {
        // Update last used timestamp
        trustedDevice.lastUsed = new Date().toISOString();
        await user.update({ trustedDevices: user.trustedDevices });
        return true;
      }

      return false;

    } catch (error) {
      console.error('Error checking trusted device:', error);
      return false;
    }
  }

  // Remove trusted device
  static async removeTrustedDevice(userId, deviceFingerprint) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const trustedDevices = user.trustedDevices || [];
      const updatedDevices = trustedDevices.filter(device => device.fingerprint !== deviceFingerprint);

      await user.update({ trustedDevices: updatedDevices });

      console.log(`📱 Trusted device removed for user ${userId}`);

      return { success: true };

    } catch (error) {
      console.error('Error removing trusted device:', error);
      throw error;
    }
  }
}

export default TwoFactorService;