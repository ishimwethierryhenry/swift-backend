// import { Router } from "express";
// import testRoutes from "./testRoutes";
// import userRoutes from "./userRoutes";
// import poolRoutes from "./poolRoutes";
// const router = Router();

// router.use("/test", testRoutes);
// router.use("/users", userRoutes);
// router.use("/pools", poolRoutes);

// export default router;

// =================== UPDATE ROUTES INDEX ===================
// Update src/routes/index.js to include water quality routes

import { Router } from "express";
import testRoutes from "./testRoutes";
import userRoutes from "./userRoutes";
import poolRoutes from "./poolRoutes";
import waterQualityRoutes from "./waterQualityRoutes";

const router = Router();

router.use("/test", testRoutes);
router.use("/users", userRoutes);
router.use("/pools", poolRoutes);
router.use("/water-quality", waterQualityRoutes);

export default router;
