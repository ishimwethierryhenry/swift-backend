// src/routes/guestFeedbackRoutes.js - FIXED VERSION
import express from "express";
import GuestFeedbackController from "../controllers/guestFeedbackController.js";
import verifyRole from "../middlewares/verifyRole.js";
import { isLoggedin } from "../middlewares/isLoggedin.js";

const guestFeedbackRoutes = express.Router();

// Add debug logging
console.log("🔧 Guest feedback routes file loaded");

// Debug route to test if routes are working
guestFeedbackRoutes.get("/test", (req, res) => {
  res.json({
    message: "Guest feedback routes are working",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /guest-feedback/submit",
      "GET /guest-feedback/my-feedback",
      "GET /guest-feedback/all",
      "GET /guest-feedback/statistics",
      "PUT /guest-feedback/respond/:feedbackId",
      "PUT /guest-feedback/status/:feedbackId"
    ]
  });
});

// Guest routes
guestFeedbackRoutes.post(
  "/submit",
  isLoggedin,
  verifyRole("guest"),
  GuestFeedbackController.submitFeedback
);

guestFeedbackRoutes.get(
  "/my-feedback",
  isLoggedin,
  verifyRole("guest"),
  GuestFeedbackController.getMyFeedback
);

// Admin routes
guestFeedbackRoutes.get(
  "/all",
  isLoggedin,
  verifyRole("admin"),
  GuestFeedbackController.getAllFeedback
);

guestFeedbackRoutes.get(
  "/statistics",
  isLoggedin,
  verifyRole("admin"),
  GuestFeedbackController.getFeedbackStats
);

guestFeedbackRoutes.put(
  "/respond/:feedbackId",
  isLoggedin,
  verifyRole("admin"),
  GuestFeedbackController.respondToFeedback
);

guestFeedbackRoutes.put(
  "/status/:feedbackId",
  isLoggedin,
  verifyRole("admin"),
  GuestFeedbackController.updateFeedbackStatus
);

console.log("✅ Guest feedback routes configured");

export default guestFeedbackRoutes;