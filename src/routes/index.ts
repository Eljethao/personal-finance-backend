import { Router } from 'express';
import authRoutes from './authRoutes';
import transactionRoutes from './transactionRoutes';
import categoryRoutes from './categoryRoutes';
import walletRoutes from './walletRoutes';
import budgetRoutes from './budgetRoutes';
import analyticsRoutes from './analyticsRoutes';
import exportRoutes from './exportRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/wallets', walletRoutes);
router.use('/budgets', budgetRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);

export default router;
