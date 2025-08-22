// src/controllers/twoFactorController.js
import { User } from "../database/models";
import TwoFactorService from "../services/twoFactorService";
import EmailService from "../services/emailService";

class TwoFactorController {
  // Setup 2FA for user
  static async setup2FA(req, res) {
    try {
      const userId = req.user.id;

      const setupData = await TwoFactorService.setupTwoFactor(userId);

      return res.status(200).json({
        status: "success",
        message: "2FA setup initiated. Scan the QR code with your authenticator app.",
        data: setupData
      });

    } catch (error) {
      console.error("Error setting up 2FA:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to setup 2FA"
      });
    }
  }

  // Verify and enable 2FA
  static async enable2FA(req, res) {
    try {
      const userId = req.user.id;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          status: "error",
          message: "Verification code is required"
        });
      }

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
      console.error("Error enabling 2FA:", error);
      return res.status(400).json({
        status: "error",
        message: error.message || "Failed to enable 2FA"
      });
    }
  }

  // Verify 2FA during login
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
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          status: "error",
          message: "Password is required to disable 2FA"
        });
      }

      await TwoFactorService.disable2FA(userId, password);

      // Send notification email
      const user = await User.findByPk(userId, {
        attributes: ['email', 'fname', 'lname']
      });

      if (user) {
        // Send 2FA disabled notification (don't wait for it)
        setImmediate(async () => {
          try {
            await EmailService.send2FADisabledNotification({
              user: {
                email: user.email,
                fname: user.fname,
                lname: user.lname
              }
            });
          } catch (emailError) {
            console.error('Failed to send 2FA disabled notification:', emailError);
          }
        });
      }

      return res.status(200).json({
        status: "success",
        message: "2FA has been disabled successfully"
      });

    } catch (error) {
      console.error("Error disabling 2FA:", error);
      return res.status(400).json({
        status: "error",
        message: error.message || "Failed to disable 2FA"
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