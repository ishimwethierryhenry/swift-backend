// src/routes/twoFactorRoutes.js
import express from "express";
import TwoFactorController from "../controllers/twoFactorController";
import { isLoggedin } from "../middlewares/isLoggedin";

const twoFactorRoutes = express.Router();

// 🆕 PUBLIC ROUTE: Verify 2FA during login (MUST be before authentication middleware)
twoFactorRoutes.post("/verify-login", TwoFactorController.verifyLoginCode);

// All other 2FA routes require authentication
twoFactorRoutes.use(isLoggedin);

// Setup and enable 2FA
twoFactorRoutes.post("/setup", TwoFactorController.setup2FA);
twoFactorRoutes.post("/enable", TwoFactorController.enable2FA);
twoFactorRoutes.post("/disable", TwoFactorController.disable2FA);
twoFactorRoutes.post("/verify-current", TwoFactorController.verifyCurrentTOTP);

// Route aliases to match frontend API calls
twoFactorRoutes.post("/generate-2fa", TwoFactorController.setup2FA);
twoFactorRoutes.post("/verify-2fa-setup", TwoFactorController.enable2FA);

// Verification routes
twoFactorRoutes.post("/verify", TwoFactorController.verify2FA);
twoFactorRoutes.get("/status", TwoFactorController.getStatus);

// Backup codes management
twoFactorRoutes.post("/regenerate-backup-codes", TwoFactorController.regenerateBackupCodes);

// Trusted devices management
twoFactorRoutes.post("/trusted-devices", TwoFactorController.addTrustedDevice);
twoFactorRoutes.delete("/trusted-devices/:deviceFingerprint", TwoFactorController.removeTrustedDevice);
twoFactorRoutes.get("/trusted-devices", TwoFactorController.getTrustedDevices);
twoFactorRoutes.post("/check-trusted-device", TwoFactorController.checkTrustedDevice);

// Add this to your twoFactorRoutes.js
twoFactorRoutes.get("/debug-endpoints", (req, res) => {
  res.status(200).json({
    message: "Available 2FA endpoints",
    endpoints: [
      "POST /2fa/setup",
      "POST /2fa/enable", 
      "POST /2fa/disable",
      "POST /2fa/verify-current",
      "POST /2fa/verify",
      "POST /2fa/verify-login",
      "GET /2fa/status",
      "POST /2fa/regenerate-backup-codes",
      "POST /2fa/trusted-devices",
      "DELETE /2fa/trusted-devices/:deviceFingerprint",
      "GET /2fa/trusted-devices",
      "POST /2fa/check-trusted-device"
    ]
  });
});

export default twoFactorRoutes;