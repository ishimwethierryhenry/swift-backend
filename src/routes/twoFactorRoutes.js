// src/routes/twoFactorRoutes.js
import express from "express";
import TwoFactorController from "../controllers/twoFactorController";
import { isLoggedin } from "../middlewares/isLoggedin";

const twoFactorRoutes = express.Router();

// All 2FA routes require authentication
twoFactorRoutes.use(isLoggedin);

// Setup and enable 2FA
twoFactorRoutes.post("/setup", TwoFactorController.setup2FA);
twoFactorRoutes.post("/enable", TwoFactorController.enable2FA);
twoFactorRoutes.post("/disable", TwoFactorController.disable2FA);

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

export default twoFactorRoutes;