// BACKEND: src/routes/analyticsRoutes.js
import { Router } from 'express';
import AnalyticsController from '../controllers/analyticsController.js';
import { isLoggedin } from '../middlewares/isLoggedin.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(isLoggedin);

// Real-time metrics endpoint
router.get('/realtime', AnalyticsController.getRealtimeMetrics);

// Pool status distribution
router.get('/pool-status', AnalyticsController.getPoolStatusDistribution);

// Operator performance analytics
router.get('/operators', AnalyticsController.getOperatorPerformance);

// System health metrics
router.get('/system-health', AnalyticsController.getSystemHealth);

// Comprehensive dashboard summary
router.get('/dashboard-summary', AnalyticsController.getDashboardSummary);

export default router;