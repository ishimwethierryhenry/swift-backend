import express from "express";
import DeviceController from "../controllers/deviceController.js";
import verifyRole from "../middlewares/verifyRole.js";      // Add .js
import { isLoggedin } from "../middlewares/isLoggedin.js";  // Add .js

const deviceRoutes = express.Router();

// Add debug logging
console.log("✅ Device routes file loaded");

deviceRoutes.post(
  "/start-recording",
  isLoggedin,
  verifyRole("admin,operator", true),
  DeviceController.startRecording
);

deviceRoutes.post(
  "/stop-recording", 
  isLoggedin,
  verifyRole("admin,operator", true),
  DeviceController.stopRecording
);

deviceRoutes.get(
  "/status/:poolId",
  isLoggedin,
  DeviceController.getDeviceStatus
);

console.log("✅ Device routes registered");

export default deviceRoutes;