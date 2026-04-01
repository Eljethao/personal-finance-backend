import { Router } from 'express';
import * as walletController from '../controllers/walletController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', walletController.getWallets as any);
router.post('/', walletController.createWallet as any);
router.put('/:id', walletController.updateWallet as any);
router.delete('/:id', walletController.deleteWallet as any);
export default router;
