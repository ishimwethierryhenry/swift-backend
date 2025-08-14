import express from "express";
import PoolController from "../controllers/poolController";
import verifyRole from "../middlewares/verifyRole";
import { isLoggedin } from "../middlewares/isLoggedin";

const poolRoutes = express.Router();

poolRoutes.post(
  "/create",
  isLoggedin,
  verifyRole("admin"),
  PoolController.createPool
);
poolRoutes.get(
  "/pool/:id",
  isLoggedin,
  verifyRole("admin"),
  PoolController.getSinglePool
);
poolRoutes.get(
  "/locations",
  isLoggedin,
  verifyRole("overseer"),
  PoolController.groupAllPoolsByLocation
);
poolRoutes.get(
  "/operator/:userId",
  isLoggedin,
  PoolController.getPoolsByOperator
);
poolRoutes.get(
  "/:location",
  isLoggedin,
  verifyRole("admin,overseer", true),
  PoolController.getAllPools
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

export default poolRoutes;
