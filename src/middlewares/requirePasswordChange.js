// src/middlewares/requirePasswordChange.js
import { User } from "../database/models";

export const requirePasswordChange = async (req, res, next) => {
  try {
    // Skip password change requirement for password-related endpoints
    const exemptPaths = [
      '/password/force-change',
      '/password/change',
      '/password/requirements',
      '/users/login',
      '/users/signup',
      '/password/forgot',
      '/password/reset'
    ];

    // Check if current path is exempt
    const isExemptPath = exemptPaths.some(path => req.path.includes(path));
    if (isExemptPath) {
      return next();
    }

    // Check if user exists in request (from authentication middleware)
    if (!req.user || !req.user.id) {
      return next(); // Let authentication middleware handle this
    }

    // Get user's password change status
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'isFirstLogin', 'passwordChangedAt']
    });

    if (!user) {
      return res.status(401).json({ 
        message: "User not found" 
      });
    }

    // Check if user needs to change password
    if (user.isFirstLogin) {
      return res.status(403).json({
        message: "Password change required",
        requiresPasswordChange: true,
        isFirstLogin: true,
        redirectTo: "/change-password"
      });
    }

    // User doesn't need password change, continue
    next();

  } catch (error) {
    console.error("Error in requirePasswordChange middleware:", error);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

export default requirePasswordChange;