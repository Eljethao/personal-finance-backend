import { Router } from 'express';
import * as budgetController from '../controllers/budgetController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
// /status must be before /:id to avoid being caught as a param
router.get('/status', budgetController.getBudgetStatus as any);
router.get('/', budgetController.getBudgets as any);
router.post('/', budgetController.createBudget as any);
router.put('/:id', budgetController.updateBudget as any);
router.delete('/:id', budgetController.deleteBudget as any);
export default router;
