// src/routes/index.js - FIXED VERSION
import express from "express";
import userRoutes from "./userRoutes.js";
import poolRoutes from "./poolRoutes.js";
import poolDataRoutes from "./poolDataRoutes.js";
import deviceRoutes from "./deviceRoutes.js";
import testRoutes from "./testRoutes.js";
import waterQualityRoutes from "./waterQualityRoutes.js";
import guestFeedbackRoutes from "./guestFeedbackRoutes.js";
import twoFactorRoutes from "./twoFactorRoutes.js";
import passwordRoutes from "./passwordRoutes.js";
import analyticsRoutes from './analyticsRoutes.js';

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

// 🔥 CRITICAL FIX: Make sure this route is properly registered
router.use("/guest-feedback", guestFeedbackRoutes);
console.log("✅ Guest feedback routes registered at /guest-feedback"); // Debug log

router.use("/2fa", twoFactorRoutes);
router.use("/password", passwordRoutes);
router.use('/analytics', analyticsRoutes);

// 🔥 ADD DEBUG ROUTE to test feedback endpoints
router.get("/debug/feedback-routes", (req, res) => {
  res.json({
    message: "Feedback routes debug info",
    availableRoutes: [
      "POST /guest-feedback/submit",
      "GET /guest-feedback/my-feedback", 
      "GET /guest-feedback/all",
      "GET /guest-feedback/statistics",
      "PUT /guest-feedback/respond/:feedbackId",
      "PUT /guest-feedback/status/:feedbackId"
    ],
    timestamp: new Date().toISOString()
  });
});

export default router;