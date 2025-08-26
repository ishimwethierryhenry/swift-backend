// src/routes/index.js - ADD PASSWORD ROUTES TO YOUR EXISTING ROUTES
import express from "express";
import userRoutes from "./userRoutes.js";
import poolRoutes from "./poolRoutes.js";
import poolDataRoutes from "./poolDataRoutes.js";
import deviceRoutes from "./deviceRoutes.js";
import testRoutes from "./testRoutes.js";
import waterQualityRoutes from "./waterQualityRoutes.js";
import guestFeedbackRoutes from "./guestFeedbackRoutes.js";
import twoFactorRoutes from "./twoFactorRoutes.js";
import passwordRoutes from "./passwordRoutes.js"; // ✅ ADD THIS LINE

const router = express.Router();

// Test route
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to SWIFT Pool Management API",
    status: "Server is running successfully",
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use("/users", userRoutes);
router.use("/pools", poolRoutes);
router.use("/pool-data", poolDataRoutes);
router.use("/device", deviceRoutes);
router.use("/test", testRoutes);
router.use("/water-quality", waterQualityRoutes);
router.use("/guest-feedback", guestFeedbackRoutes);
router.use("/2fa", twoFactorRoutes);
router.use("/password", passwordRoutes); // ✅ ADD THIS LINE

export default router;