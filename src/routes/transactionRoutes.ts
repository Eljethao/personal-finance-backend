import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.use(authenticate);
router.get('/', transactionController.getTransactions as any);
router.post('/', transactionController.createTransaction as any);
router.put('/:id', transactionController.updateTransaction as any);
router.delete('/:id', transactionController.deleteTransaction as any);
router.post('/upload-slip', upload.single('slip'), transactionController.uploadSlip as any);

export default router;
