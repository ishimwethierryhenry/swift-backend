// src/controllers/passwordController.js - FIXED EMAIL SERVICE CALL
import { User } from "../database/models";
import bcrypt from "bcrypt";
import TokenService from "../services/tokenService";
import EmailService from "../services/emailService";
import passwordSchema from "../validations/passwordSchema";

class PasswordController {
  // Request password reset
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      console.log('📧 Password reset requested for:', email);

      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Email is required"
        });
      }

      // Find user by email
      const user = await User.findOne({ where: { email } });
      
      console.log('Password reset requested for user:', user ? `${user.fname} ${user.lname} (${user.email})` : 'User not found');
      
      // Don't reveal if email exists (security best practice)
      // Always return success to prevent email enumeration
      if (!user) {
        return res.status(200).json({
          status: "success",
          message: "If an account with that email exists, a password reset link has been sent."
        });
      }

      // Get client info
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Generate reset token
      const { token, expiresAt } = await TokenService.generatePasswordResetToken(
        user.id,
        ipAddress,
        userAgent
      );

      console.log('Reset token generated:', token);
      console.log('Reset URL would be:', `https://swift-jade.vercel.app/reset-password/${token}`);
      // console.log('Reset URL would be:', `http://localhost:5173/reset-password/${token}`);


      // FIXED: Call email service with correct parameters
      await EmailService.sendPasswordResetEmail(
        user.email,    // email parameter
        token,         // resetToken parameter  
        user.fname     // firstName parameter
      );

      console.log(`📧 Password reset email sent to ${email}`);

      return res.status(200).json({
        status: "success",
        message: "If an account with that email exists, a password reset link has been sent.",
        expiresIn: "5 minutes"
      });

    } catch (error) {
      console.error("❌ Error requesting password reset:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // Verify reset token
  static async verifyResetToken(req, res) {
    try {
      const { token } = req.params;

      if (!TokenService.validateTokenFormat(token, 'password')) {
        return res.status(400).json({
          status: "error",
          message: "Invalid token format"
        });
      }

      const verification = await TokenService.verifyPasswordResetToken(token);

      if (!verification.valid) {
        return res.status(400).json({
          status: "error",
          message: verification.error
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Token is valid",
        user: {
          email: verification.resetToken.user.email,
          name: `${verification.resetToken.user.fname} ${verification.resetToken.user.lname}`
        }
      });

    } catch (error) {
      console.error("Error verifying reset token:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }

  // Reset password with token
  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { newPassword, confirmPassword } = req.body;

      // Validate token format
      if (!TokenService.validateTokenFormat(token, 'password')) {
        return res.status(400).json({
          status: "error",
          message: "Invalid token format"
        });
      }

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          status: "error",
          message: "Passwords do not match"
        });
      }

      // Validate password strength
      const { error } = passwordSchema.validate({ password: newPassword });
      if (error) {
        return res.status(400).json({
          status: "error",
          message: error.details[0].message
        });
      }

      // Verify token
      const verification = await TokenService.verifyPasswordResetToken(token);
      if (!verification.valid) {
        return res.status(400).json({
          status: "error",
          message: verification.error
        });
      }

      const user = verification.resetToken.user;

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password
      await User.update(
        { 
          pwd: hashedPassword,
          passwordChangedAt: new Date(),
          isFirstLogin: false, // Reset first login flag
          loginAttempts: 0, // Reset login attempts
          lockedUntil: null // Remove any account lock
        },
        { where: { id: user.id } }
      );

      // Mark token as used
      await TokenService.markPasswordResetTokenAsUsed(token);

      // Send confirmation email (if you have this method)
      // await EmailService.sendPasswordChangedNotification({
      //   user: {
      //     email: user.email,
      //     fname: user.fname,
      //     lname: user.lname
      //   }
      // });

      console.log(`✅ Password reset completed for user ${user.id}`);

      return res.status(200).json({
        status: "success",
        message: "Password has been reset successfully. You can now login with your new password."
      });

    } catch (error) {
      console.error("Error resetting password:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // Change password (authenticated user)
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          status: "error",
          message: "Current password, new password, and confirmation are required"
        });
      }

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          status: "error",
          message: "New passwords do not match"
        });
      }

      // Validate password strength
      const { error } = passwordSchema.validate({ password: newPassword });
      if (error) {
        return res.status(400).json({
          status: "error",
          message: error.details[0].message
        });
      }

      // Get user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found"
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.checkPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          status: "error",
          message: "Current password is incorrect"
        });
      }

      // Check if new password is same as current
      const isSamePassword = await user.checkPassword(newPassword);
      if (isSamePassword) {
        return res.status(400).json({
          status: "error",
          message: "New password must be different from current password"
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password
      await user.update({
        pwd: hashedPassword,
        passwordChangedAt: new Date(),
        isFirstLogin: false
      });

      // Send notification email (if you have this method)
      // await EmailService.sendPasswordChangedNotification({
      //   user: {
      //     email: user.email,
      //     fname: user.fname,
      //     lname: user.lname
      //   }
      // });

      console.log(`✅ Password changed for user ${userId}`);

      return res.status(200).json({
        status: "success",
        message: "Password changed successfully"
      });

    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // Force password change for first login
  static async forcePasswordChange(req, res) {
    try {
      const { newPassword, confirmPassword } = req.body;
      const userId = req.user.id;

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          status: "error",
          message: "Passwords do not match"
        });
      }

      // Validate password strength
      const { error } = passwordSchema.validate({ password: newPassword });
      if (error) {
        return res.status(400).json({
          status: "error",
          message: error.details[0].message
        });
      }

      // Get user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found"
        });
      }

      // Check if user really needs to change password
      if (!user.isFirstLogin) {
        return res.status(400).json({
          status: "error",
          message: "Password change not required"
        });
      }

      // Check if new password is same as default
      const isSamePassword = await user.checkPassword(newPassword);
      if (isSamePassword) {
        return res.status(400).json({
          status: "error",
          message: "New password must be different from the default password"
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password
      await user.update({
        pwd: hashedPassword,
        passwordChangedAt: new Date(),
        isFirstLogin: false,
        lastLoginAt: new Date()
      });

      console.log(`✅ First login password change completed for user ${userId}`);

      return res.status(200).json({
        status: "success",
        message: "Password has been set successfully. Welcome to SWIFT!",
        isFirstLogin: false
      });

    } catch (error) {
      console.error("Error in force password change:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // Check password requirements
  static async checkPasswordRequirements(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: ['id', 'isFirstLogin', 'passwordChangedAt', 'lastLoginAt']
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
          requiresPasswordChange: user.isFirstLogin,
          isFirstLogin: user.isFirstLogin,
          passwordLastChanged: user.passwordChangedAt,
          lastLogin: user.lastLoginAt
        }
      });

    } catch (error) {
      console.error("Error checking password requirements:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  }
}

export default PasswordController;