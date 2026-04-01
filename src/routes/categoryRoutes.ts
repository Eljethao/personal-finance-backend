import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', categoryController.getCategories as any);
router.post('/', categoryController.createCategory as any);
router.put('/:id', categoryController.updateCategory as any);
router.delete('/:id', categoryController.deleteCategory as any);
export default router;
