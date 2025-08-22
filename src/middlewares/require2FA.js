// src/middlewares/require2FA.js
import { User } from "../database/models";
import TwoFactorService from "../services/twoFactorService";

export const require2FA = async (req, res, next) => {
  try {
    // Skip 2FA for certain endpoints
    const exemptPaths = [
      '/two-factor/setup',
      '/two-factor/enable',
      '/two-factor/verify',
      '/two-factor/status',
      '/users/login',
      '/users/signup',
      '/password/',
      '/two-factor/check-trusted-device'
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

    // Get user's 2FA status
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'twoFactorEnabled', 'trustedDevices']
    });

    if (!user) {
      return res.status(401).json({ 
        message: "User not found" 
      });
    }

    // If 2FA is not enabled, allow access
    if (!user.twoFactorEnabled) {
      return next();
    }

    // Check if device is trusted
    const deviceFingerprint = req.headers['x-device-fingerprint'];
    if (deviceFingerprint) {
      const isTrusted = await TwoFactorService.isDeviceTrusted(user.id, deviceFingerprint);
      if (isTrusted) {
        return next(); // Trusted device, allow access
      }
    }

    // Check for 2FA verification token in session or headers
    const twoFactorVerified = req.session?.twoFactorVerified || req.headers['x-2fa-verified'];
    const twoFactorTimestamp = req.session?.twoFactorTimestamp || req.headers['x-2fa-timestamp'];

    if (twoFactorVerified && twoFactorTimestamp) {
      // Check if 2FA verification is still valid (30 minutes)
      const verificationAge = Date.now() - parseInt(twoFactorTimestamp);
      const thirtyMinutes = 30 * 60 * 1000;

      if (verificationAge < thirtyMinutes) {
        return next(); // 2FA recently verified, allow access
      }
    }

    // 2FA verification required
    return res.status(403).json({
      message: "Two-factor authentication required",
      requires2FA: true,
      twoFactorEnabled: true,
      redirectTo: "/two-factor-verify"
    });

  } catch (error) {
    console.error("Error in require2FA middleware:", error);
    return res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// Middleware to mark 2FA as verified (call after successful 2FA verification)
export const mark2FAVerified = (req, res, next) => {
  if (req.session) {
    req.session.twoFactorVerified = true;
    req.session.twoFactorTimestamp = Date.now().toString();
  }
  
  // Also set headers for stateless applications
  res.setHeader('x-2fa-verified', 'true');
  res.setHeader('x-2fa-timestamp', Date.now().toString());
  
  next();
};

export default require2FA;