// src/routes/deviceRoutes.js
import express from "express";
import DeviceController from "../controllers/deviceController";
import verifyRole from "../middlewares/verifyRole";
import { isLoggedin } from "../middlewares/isLoggedin";

const deviceRoutes = express.Router();

// Start device recording (admin and operators only)
deviceRoutes.post(
  "/start-recording",
  isLoggedin,
  verifyRole("admin,operator", true),
  DeviceController.startRecording
);

// Stop device recording (admin and operators only)
deviceRoutes.post(
  "/stop-recording",
  isLoggedin,
  verifyRole("admin,operator", true),
  DeviceController.stopRecording
);

// Get device status (all authenticated users)
deviceRoutes.get(
  "/status/:poolId",
  isLoggedin,
  DeviceController.getDeviceStatus
);

export default deviceRoutes;