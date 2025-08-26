// src/controllers/twoFactorController.js
import { User } from "../database/models/index.js";
import TwoFactorService from "../services/twoFactorService.js";
import EmailService from "../services/emailService.js";
import generateToken from "../helpers/tokenGen.js";

class TwoFactorController {
  // Setup 2FA for user
  static async setup2FA(req, res) {
    console.log('🚀 setup2FA method called!');
    console.log('👤 User from middleware:', req.user?.id);
    
    try {
      const userId = req.user.id;
      
      if (!userId) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated"
        });
      }

      console.log('📱 Calling TwoFactorService.setupTwoFactor...');
      const setupData = await TwoFactorService.setupTwoFactor(userId);
      console.log('✅ Setup data received:', setupData);

      return res.status(200).json({
        status: "success",
        message: "2FA setup initiated. Scan the QR code with your authenticator app.",
        data: setupData
      });

    } catch (error) {
      console.error("❌ Error setting up 2FA:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to setup 2FA"
      });
    }
  }

  // Verify and enable 2FA
  static async enable2FA(req, res) {
    console.log('🔐 enable2FA method called!');
    
    try {
      const userId = req.user.id;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          status: "error",
          message: "Verification code is required"
        });
      }

      console.log('🔍 Verifying token for user:', userId);
      const result = await TwoFactorService.verifyAndEnable2FA(userId, token);

      // Send notification email
      const user = await User.findByPk(userId, {
        attributes: ['email', 'fname', 'lname']
      });

      if (user) {
        // Send 2FA enabled notification (don't wait for it)
        setImmediate(async () => {
          try {
            await EmailService.send2FAEnabledNotification({
              user: {
                email: user.email,
                fname: user.fname,
                lname: user.lname
              },
              backupCodes: result.backupCodes
            });
          } catch (emailError) {
            console.error('Failed to send 2FA enabled notification:', emailError);
          }
        });
      }

      return res.status(200).json({
        status: "success",
        message: "2FA has been enabled successfully!",
        data: {
          backupCodes: result.backupCodes,
          enabled: true
        }
      });

    } catch (error) {
      console.error("❌ Error enabling 2FA:", error);
      return res.status(400).json({
        status: "error",
        message: error.message || "Failed to enable 2FA"
      });
    }
  }

  // 🆕 NEW: Verify 2FA during login (different from setup verification)
  static async verifyLoginCode(req, res) {
    try {
      const { code, isBackupCode = false, userId } = req.body;

      if (!userId || !code) {
        return res.status(400).json({
          status: "error",
          message: "User ID and verification code are required"
        });
      }

      console.log(`🔍 Verifying login 2FA for user ${userId}, backup code: ${isBackupCode}`);

      const isValid = await TwoFactorService.verifyLogin2FA(userId, code, isBackupCode);

      if (!isValid) {
        return res.status(400).json({
          status: "error",
          message: isBackupCode 
            ? "Invalid backup code. Please check and try again."
            : "Invalid verification code. Please check your authenticator app."
        });
      }

      // 🔥 Generate token after successful 2FA verification
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found"
        });
      }

      const payload = { user };
      const token = await generateToken(payload, "1d");

      const userInfo = {
        id: user.id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role,
        location: user.location,
        isFirstLogin: user.isFirstLogin,
        twoFactorEnabled: user.twoFactorEnabled,
        requiresPasswordChange: user.isFirstLogin,
        passwordChangedAt: user.passwordChangedAt,
        lastLoginAt: user.lastLoginAt
      };

      console.log(`✅ 2FA verification successful for user ${userId}`);

      return res.status(200).json({
        status: "success",
        message: "2FA verification successful",
        verified: true,
        token, // 🔥 Provide token after successful 2FA
        user: userInfo,
        redirectTo: user.isFirstLogin ? "/change-password" : null
      });

    } catch (error) {
      console.error("Error verifying login 2FA:", error);
      return res.status(400).json({
        status: "error",
        message: error.message || "2FA verification failed"
      });
    }
  }

  // Verify 2FA during login (keeping your existing method name)
  static async verify2FA(req, res) {
    try {
      const { userId, token, isBackupCode = false } = req.body;

      if (!userId || !token) {
        return res.status(400).json({
          status: "error",
          message: "User ID and verification code are required"
        });
      }

      const isValid = await TwoFactorService.verifyLogin2FA(userId, token, isBackupCode);

      if (!isValid) {
        return res.status(400).json({
          status: "error",
          message: "Invalid verification code"
        });
      }

      return res.status(200).json({
        status: "success",
        message: "2FA verification successful",
        verified: true
      });

    } catch (error) {
      console.error("Error verifying 2FA:", error);
      return res.status(400).json({
        status: "error",
        message: error.message || "2FA verification failed"
      });
    }
  }

  // Get 2FA status
  static async getStatus(req, res) {
    try {
      const userId = req.user.id;

      const status = await TwoFactorService.get2FAStatus(userId);

      return res.status(200).json({
        status: "success",
        data: status
      });

    } catch (error) {
      console.error("Error getting 2FA status:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to get 2FA status"
      });
    }
  }

  // Regenerate backup codes
  static async regenerateBackupCodes(req, res) {
    try {
      const userId = req.user.id;

      const backupCodes = await TwoFactorService.regenerateBackupCodes(userId);

      return res.status(200).json({
        status: "success",
        message: "Backup codes regenerated successfully",
        data: {
          backupCodes
        }
      });

    } catch (error) {
      console.error("Error regenerating backup codes:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to regenerate backup codes"
      });
    }
  }

  // Disable 2FA
  static async disable2FA(req, res) {
    try {
      const userId = req.user.id;
      const { token, password } = req.body;

      // Get user with 2FA secret
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found"
        });
      }

      if (!user.twoFactorEnabled) {
        return res.status(400).json({
          status: "error",
          message: "2FA is not enabled for this user"
        });
      }

      // If token is provided, verify current TOTP before disabling
      if (token) {
        const isValidTOTP = await TwoFactorService.verifyLogin2FA(userId, token, false);
        if (!isValidTOTP) {
          return res.status(400).json({
            status: "error",
            message: "Invalid verification code. Please check your authenticator app."
          });
        }
      }

      // Verify password if provided (additional security)
      if (password) {
        const isPasswordValid = await user.checkPassword(password);
        if (!isPasswordValid) {
          return res.status(400).json({
            status: "error",
            message: "Invalid password"
          });
        }
      }

      // Disable 2FA using your existing service
      await TwoFactorService.disable2FA(userId, password);

      // Send notification email
      const userDetails = await User.findByPk(userId, {
        attributes: ['email', 'fname', 'lname']
      });

      if (userDetails) {
        // Send 2FA disabled notification (don't wait for it)
        setImmediate(async () => {
          try {
            await EmailService.send2FADisabledNotification({
              user: {
                email: userDetails.email,
                fname: userDetails.fname,
                lname: userDetails.lname
              }
            });
          } catch (emailError) {
            console.error('Failed to send 2FA disabled notification:', emailError);
          }
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Two-Factor Authentication has been successfully disabled"
      });

    } catch (error) {
      console.error("Error disabling 2FA:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to disable 2FA"
      });
    }
  }

  // Verify current TOTP (used before disabling 2FA)
  static async verifyCurrentTOTP(req, res) {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          status: "error",
          message: "Verification code is required"
        });
      }

      const isValid = await TwoFactorService.verifyCurrentTOTP(userId, token);

      if (!isValid) {
        return res.status(400).json({
          status: "error",
          message: "Invalid verification code. Please check your authenticator app."
        });
      }

      return res.status(200).json({
        status: "success",
        message: "TOTP verification successful",
        verified: true
      });

    } catch (error) {
      console.error("Error verifying current TOTP:", error);
      return res.status(400).json({
        status: "error",
        message: error.message || "TOTP verification failed"
      });
    }
  }

  // Add trusted device
  static async addTrustedDevice(req, res) {
    try {
      const userId = req.user.id;
      const { deviceFingerprint, deviceName } = req.body;

      if (!deviceFingerprint) {
        return res.status(400).json({
          status: "error",
          message: "Device fingerprint is required"
        });
      }

      const deviceInfo = {
        name: deviceName || 'Unknown Device',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress
      };

      const result = await TwoFactorService.addTrustedDevice(userId, deviceFingerprint, deviceInfo);

      return res.status(200).json({
        status: "success",
        message: "Device added to trusted devices",
        data: result
      });

    } catch (error) {
      console.error("Error adding trusted device:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to add trusted device"
      });
    }
  }

  // Remove trusted device
  static async removeTrustedDevice(req, res) {
    try {
      const userId = req.user.id;
      const { deviceFingerprint } = req.params;

      if (!deviceFingerprint) {
        return res.status(400).json({
          status: "error",
          message: "Device fingerprint is required"
        });
      }

      await TwoFactorService.removeTrustedDevice(userId, deviceFingerprint);

      return res.status(200).json({
        status: "success",
        message: "Device removed from trusted devices"
      });

    } catch (error) {
      console.error("Error removing trusted device:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to remove trusted device"
      });
    }
  }

  // Get trusted devices
  static async getTrustedDevices(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: ['trustedDevices']
      });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found"
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          trustedDevices: user.trustedDevices || []
        }
      });

    } catch (error) {
      console.error("Error getting trusted devices:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to get trusted devices"
      });
    }
  }

  // Check if device is trusted
  static async checkTrustedDevice(req, res) {
    try {
      const userId = req.user.id;
      const { deviceFingerprint } = req.body;

      if (!deviceFingerprint) {
        return res.status(400).json({
          status: "error",
          message: "Device fingerprint is required"
        });
      }

      const isTrusted = await TwoFactorService.isDeviceTrusted(userId, deviceFingerprint);

      return res.status(200).json({
        status: "success",
        data: {
          isTrusted,
          deviceFingerprint
        }
      });

    } catch (error) {
      console.error("Error checking trusted device:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to check trusted device"
      });
    }
  }
}

export default TwoFactorController;