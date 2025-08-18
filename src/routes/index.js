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

// import { Router } from "express";
// import testRoutes from "./testRoutes";
// import userRoutes from "./userRoutes";
// import poolRoutes from "./poolRoutes";
// import waterQualityRoutes from "./waterQualityRoutes";

// const router = Router();

// router.use("/test", testRoutes);
// router.use("/users", userRoutes);
// router.use("/pools", poolRoutes);
// router.use("/water-quality", waterQualityRoutes);

// export default router;





// // src/routes/index.js - Updated version
// import { Router } from "express";
// import testRoutes from "./testRoutes";
// import userRoutes from "./userRoutes";
// import poolRoutes from "./poolRoutes";
// import waterQualityRoutes from "./waterQualityRoutes";
// import deviceRoutes from "./deviceRoutes";
// import poolDataRoutes from "./poolDataRoutes";

// const router = Router();

// router.use("/test", testRoutes);
// router.use("/users", userRoutes);
// router.use("/pools", poolRoutes);
// router.use("/water-quality", waterQualityRoutes);
// router.use("/device", deviceRoutes);
// router.use("/pool-data", poolDataRoutes);

// export default router;






// =================== UPDATE ROUTES INDEX ===================
// Update src/routes/index.js to include feedback routes

import { Router } from "express";
import testRoutes from "./testRoutes";
import userRoutes from "./userRoutes";
import poolRoutes from "./poolRoutes";
import waterQualityRoutes from "./waterQualityRoutes";
import deviceRoutes from "./deviceRoutes";
import poolDataRoutes from "./poolDataRoutes";
import guestFeedbackRoutes from "./guestFeedbackRoutes";

const router = Router();

router.use("/test", testRoutes);
router.use("/users", userRoutes);
router.use("/pools", poolRoutes);
router.use("/water-quality", waterQualityRoutes);
router.use("/device", deviceRoutes);
router.use("/pool-data", poolDataRoutes);
router.use("/feedback", guestFeedbackRoutes);

export default router;
