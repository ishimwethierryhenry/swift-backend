// src/routes/poolRoutes.js
import express from "express";
import PoolController from "../controllers/poolController";
import verifyRole from "../middlewares/verifyRole";
import { isLoggedin } from "../middlewares/isLoggedin";

const poolRoutes = express.Router();

// Admin only routes
poolRoutes.post(
  "/create",
  isLoggedin,
  verifyRole("admin"),
  PoolController.createPool
);

poolRoutes.put(
  "/update/:poolId",
  isLoggedin,
  verifyRole("admin"),
  PoolController.updatePool
);

poolRoutes.delete(
  "/delete/:id",
  isLoggedin,
  verifyRole("admin"),
  PoolController.deletePool
);

poolRoutes.put(
  "/assign/:poolId",
  isLoggedin,
  verifyRole("admin"),
  PoolController.assignUserToPool
);

// Admin and overseer routes
poolRoutes.get(
  "/locations",
  isLoggedin,
  verifyRole("admin,overseer", true),
  PoolController.groupAllPoolsByLocation
);

// Routes accessible by admin, overseer, and guest
poolRoutes.get(
  "/pool/:id",
  isLoggedin,
  verifyRole("admin,overseer,guest", true),
  PoolController.getSinglePool
);

poolRoutes.get(
  "/:location",
  isLoggedin,
  verifyRole("admin,overseer,guest", true),
  PoolController.getAllPools
);

// Operator specific route (and admin can access too)
poolRoutes.get(
  "/operator/:userId",
  isLoggedin,
  verifyRole("admin,operator", true),
  PoolController.getPoolsByOperator
);

export default poolRoutes;