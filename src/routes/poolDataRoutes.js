// src/routes/poolDataRoutes.js
import express from "express";
import PoolDataController from "../controllers/poolDataController";
import verifyRole from "../middlewares/verifyRole";
import { isLoggedin } from "../middlewares/isLoggedin";

const poolDataRoutes = express.Router();

// Save test data (admin and operators only)
poolDataRoutes.post(
  "/save-test-data",
  isLoggedin,
  verifyRole("admin,operator", true),
  PoolDataController.saveTestData
);

// Get recent test data (all authenticated users)
poolDataRoutes.get(
  "/recent/:poolId",
  isLoggedin,
  PoolDataController.getRecentTestData
);

// Get pool testing statistics (all authenticated users)
poolDataRoutes.get(
  "/stats/:poolId",
  isLoggedin,
  PoolDataController.getPoolTestingStats
);

// Simulate device data (for testing - admin only)
poolDataRoutes.post(
  "/simulate/:poolId",
  isLoggedin,
  verifyRole("admin"),
  PoolDataController.simulateDeviceData
);

export default poolDataRoutes;