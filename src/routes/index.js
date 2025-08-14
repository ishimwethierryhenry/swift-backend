import { Router } from "express";
import testRoutes from "./testRoutes";
import userRoutes from "./userRoutes";
import poolRoutes from "./poolRoutes";
const router = Router();

router.use("/test", testRoutes);
router.use("/users", userRoutes);
router.use("/pools", poolRoutes);

export default router;
