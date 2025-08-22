// src/routes/passwordRoutes.js - FIXED VERSION
import express from "express";
import PasswordController from "../controllers/passwordController.js";
import { isLoggedin } from "../middlewares/isLoggedin.js";
import verifyRole from "../middlewares/verifyRole.js";

const passwordRoutes = express.Router();

// Add test route for debugging
passwordRoutes.get("/test", (req, res) => {
  console.log('🔧 Password routes test endpoint hit!');
  res.json({ message: 'Password routes are working!', timestamp: new Date() });
});

// Public routes (no authentication required)
passwordRoutes.post("/forgot", PasswordController.requestPasswordReset);
passwordRoutes.get("/verify-reset-token/:token", PasswordController.verifyResetToken);
passwordRoutes.post("/reset/:token", PasswordController.resetPassword);

// Protected routes (authentication required)
passwordRoutes.put(
  "/change",
  isLoggedin,
  PasswordController.changePassword
);

passwordRoutes.post(
  "/force-change",
  isLoggedin,
  PasswordController.forcePasswordChange
);

passwordRoutes.get(
  "/requirements",
  isLoggedin,
  PasswordController.checkPasswordRequirements
);

export default passwordRoutes;