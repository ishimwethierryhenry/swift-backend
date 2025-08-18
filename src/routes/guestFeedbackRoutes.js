// =================== ROUTES ===================
// src/routes/guestFeedbackRoutes.js
import express from "express";
import GuestFeedbackController from "../controllers/guestFeedbackController";
import verifyRole from "../middlewares/verifyRole";
import { isLoggedin } from "../middlewares/isLoggedin";

const guestFeedbackRoutes = express.Router();

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

export default guestFeedbackRoutes;