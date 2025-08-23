// src/controllers/userController.js - UPDATED WITH SECURITY FEATURES
import { User } from "../database/models";
import bcrypt from "bcrypt";
import generateToken from "../helpers/tokenGen";
import userSchema from "../validations/userSchema";
import EmailService from "../services/emailService";

class UserController {
  //signup
  static async createUser(req, res) {
    try {
      const { error } = userSchema.validate(req.body);
      if (error)
        return res
          .status(400)
          .json({ validationError: error.details[0].message });

      const duplicatedEmail = await User.findOne({
        where: { email: req.body.email },
      });
      if (duplicatedEmail) {
        return res.status(409).json({
          message: "User already exists !!!",
        });
      }

      const salt = await bcrypt.genSalt(12); // ✅ INCREASED SALT ROUNDS FOR SECURITY
      const hashedPassword = await bcrypt.hash("12345678", salt);

      // Determine default role based on request or default to 'operator'
      const userRole = req.body.role || "operator";
      
      // Validate role
      const allowedRoles = ['admin', 'operator', 'overseer', 'guest'];
      if (!allowedRoles.includes(userRole)) {
        return res.status(400).json({
          message: "Invalid role specified. Allowed roles: admin, operator, overseer, guest"
        });
      }

      const newUser = await User.create({
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        pwd: hashedPassword,
        gender: req.body.gender,
        role: userRole,
        // ✅ SECURITY FIELDS - SET DEFAULTS
        isFirstLogin: true,
        passwordChangedAt: null,
        lastLoginAt: null,
        loginAttempts: 0,
        lockedUntil: null,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null,
        trustedDevices: null,
        securityNotifications: true,
      });

      return res.status(201).json({
        status: "Success",
        message: "User created successfully !!!",
        user: newUser,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }

  //login - ✅ ENHANCED WITH SECURITY FEATURES
  // src/controllers/userController.js - Updated login method (around line 70)

static async login(req, res) {
  try {
    const { email, pwd } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(400).json({ message: "user not found" });

    // ✅ CHECK IF ACCOUNT IS LOCKED
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const lockTimeRemaining = Math.ceil((user.lockedUntil - new Date()) / (1000 * 60)); // minutes
      return res.status(423).json({ 
        message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`,
        lockedUntil: user.lockedUntil
      });
    }

    if (await user.checkPassword(pwd)) {
      // ✅ RESET LOGIN ATTEMPTS ON SUCCESSFUL LOGIN
      await user.update({
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      });

      const payload = {
        user,
      };

      const token = await generateToken(payload, "1d");

      // ✅ ENHANCED USER INFO WITH FIRST LOGIN FLAG
      const userInfo = {
        id: user.id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role,
        location: user.location,
        isFirstLogin: user.isFirstLogin, // 🔥 CRITICAL FOR FRONTEND
        twoFactorEnabled: user.twoFactorEnabled,
        requiresPasswordChange: user.isFirstLogin, // 🔥 EXPLICIT FLAG
        passwordChangedAt: user.passwordChangedAt,
        lastLoginAt: user.lastLoginAt
      };

      return res.status(200).json({ 
        token, 
        message: user.isFirstLogin ? "First login detected - password change required" : "login successful",
        user: userInfo,
        // 🔥 ADD EXPLICIT REDIRECT INSTRUCTION FOR FRONTEND
        redirectTo: user.isFirstLogin ? "/change-password" : null
      });
    } else {
      // Handle failed login attempts...
      const newAttempts = user.loginAttempts + 1;
      const updates = { loginAttempts: newAttempts };

      if (newAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await user.update(updates);

      const remainingAttempts = Math.max(0, 5 - newAttempts);
      return res.status(400).json({ 
        message: newAttempts >= 5 
          ? "Account locked due to too many failed attempts. Try again in 30 minutes."
          : `Invalid credentials. ${remainingAttempts} attempts remaining.`,
        remainingAttempts,
        lockedUntil: updates.lockedUntil
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "login failed" });
  }
}

  //single user
  static async getSingleUser(req, res) {
    try {
      const singleUser = await User.findOne(req.params.id);
      if (!singleUser) {
        res.status(404).json({
          status: "fail",
          message: "user not found!!!",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: singleUser,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  //get all users
  static async getAllUsers(req, res) {
    try {
      // ✅ EXCLUDE SENSITIVE SECURITY FIELDS FROM RESPONSE
      const users = await User.findAll({
        attributes: {
          exclude: ['pwd', 'twoFactorSecret', 'backupCodes']
        }
      });
      res.status(200).json({
        status: "success",
        allUsers: users,
      });
    } catch (error) {
      res.status(404).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // get operators by location
  static async getAllOperators(req, res) {
    try {
      const { location } = req.params;
      const locationStr = location.replace("&", " ");
      const users = await User.findAll({
        where: { location: locationStr, role: "operator" },
        attributes: {
          exclude: ['pwd', 'twoFactorSecret', 'backupCodes'] // ✅ EXCLUDE SENSITIVE FIELDS
        }
      });
      res.status(200).json({
        status: "success",
        allUsers: users,
      });
    } catch (error) {
      res.status(404).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // get guests by location
  static async getAllGuests(req, res) {
    try {
      const { location } = req.params;
      const locationStr = location.replace("&", " ");
      const users = await User.findAll({
        where: { location: locationStr, role: "guest" },
        attributes: {
          exclude: ['pwd', 'twoFactorSecret', 'backupCodes'] // ✅ EXCLUDE SENSITIVE FIELDS
        }
      });
      res.status(200).json({
        status: "success",
        allUsers: users,
      });
    } catch (error) {
      res.status(404).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // Update user role
  static async updateUserRole(req, res) {
  try {
    const userId = req.params.userId;
    const { newRole, fname, lname, email, phone, location } = req.body;

    // Validate role if provided
    if (newRole) {
      const allowedRoles = ['admin', 'operator', 'overseer', 'guest'];
      if (!allowedRoles.includes(newRole)) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid role specified. Allowed roles: admin, operator, overseer, guest"
        });
      }
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Update all provided fields
    if (fname) user.fname = fname;
    if (lname) user.lname = lname;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (newRole) user.role = newRole;
    
    await user.save();

    // ✅ EXCLUDE SENSITIVE FIELDS FROM RESPONSE
    const safeUser = {
      id: user.id,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      phone: user.phone,
      location: user.location,
      role: user.role,
      gender: user.gender,
      isFirstLogin: user.isFirstLogin,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
}

  // Reset password - ✅ ENHANCED SECURITY
  static async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }

      const salt = await bcrypt.genSalt(12); // ✅ INCREASED SALT ROUNDS
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // ✅ UPDATE SECURITY FIELDS
      await user.update({
        pwd: hashedPassword,
        passwordChangedAt: new Date(),
        isFirstLogin: false,
        loginAttempts: 0,
        lockedUntil: null
      });

      res.status(200).json({
        status: "success",
        message: "Password reset successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }

      await user.destroy();

      res.status(200).json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // ✅ NEW METHOD: Get user security info
  static async getUserSecurityInfo(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: [
          'id', 'email', 'fname', 'lname', 'isFirstLogin', 
          'passwordChangedAt', 'lastLoginAt', 'twoFactorEnabled',
          'securityNotifications', 'trustedDevices'
        ]
      });

      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }

      res.status(200).json({
        status: "success",
        data: {
          ...user.toJSON(),
          trustedDevicesCount: user.trustedDevices ? user.trustedDevices.length : 0
        }
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }

  // ✅ NEW METHOD: Update security preferences
  static async updateSecurityPreferences(req, res) {
    try {
      const userId = req.user.id;
      const { securityNotifications } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }

      await user.update({
        securityNotifications: securityNotifications !== undefined ? securityNotifications : user.securityNotifications
      });

      res.status(200).json({
        status: "success",
        message: "Security preferences updated successfully",
        data: {
          securityNotifications: user.securityNotifications
        }
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        error: error.message,
      });
    }
  }
}

export default UserController;