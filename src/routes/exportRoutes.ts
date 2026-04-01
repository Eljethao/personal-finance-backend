import { Router } from 'express';
import * as exportController from '../controllers/exportController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/excel', exportController.exportExcel as any);
router.get('/pdf', exportController.exportPdf as any);
export default router;
