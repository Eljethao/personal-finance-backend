import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/summary', analyticsController.getSummary as any);
router.get('/by-category', analyticsController.getByCategory as any);
router.get('/monthly', analyticsController.getMonthly as any);
export default router;
