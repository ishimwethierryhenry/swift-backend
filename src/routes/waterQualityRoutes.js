// =================== ROUTES ===================
// src/routes/waterQualityRoutes.js
import express from "express";
import WaterQualityController from "../controllers/waterQualityController";
import verifyRole from "../middlewares/verifyRole";
import { isLoggedin } from "../middlewares/isLoggedin";

const waterQualityRoutes = express.Router();

// Create new water quality record (operators and admins)
waterQualityRoutes.post(
  "/record",
  isLoggedin,
  verifyRole("admin,operator", true),
  WaterQualityController.createRecord
);

// Get historical data (all authenticated users)
waterQualityRoutes.get(
  "/historical",
  isLoggedin,
  WaterQualityController.getHistoricalData
);

// Get statistics (all authenticated users)
waterQualityRoutes.get(
  "/statistics",
  isLoggedin,
  WaterQualityController.getStatistics
);

// Get monthly aggregated data (all authenticated users)
waterQualityRoutes.get(
  "/monthly",
  isLoggedin,
  WaterQualityController.getMonthlyData
);

// Update record (admins and record owner)
waterQualityRoutes.put(
  "/record/:recordId",
  isLoggedin,
  verifyRole("admin,operator", true),
  WaterQualityController.updateRecord
);

// Delete record (admins only)
waterQualityRoutes.delete(
  "/record/:recordId",
  isLoggedin,
  verifyRole("admin"),
  WaterQualityController.deleteRecord
);

export default waterQualityRoutes;