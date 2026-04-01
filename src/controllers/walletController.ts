import { Response, NextFunction } from 'express';
import * as walletService from '../services/walletService';
import { AuthRequest } from '../types';

export const getWallets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const wallets = await walletService.getWallets(req.user!.id);
    res.json({ success: true, data: wallets, message: 'Wallets fetched' });
  } catch (err) {
    next(err);
  }
};

export const createWallet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const wallet = await walletService.createWallet(req.user!.id, req.body);
    res.status(201).json({ success: true, data: wallet, message: 'Wallet created' });
  } catch (err) {
    next(err);
  }
};

export const updateWallet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const wallet = await walletService.updateWallet(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: wallet, message: 'Wallet updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteWallet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await walletService.deleteWallet(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Wallet deleted' });
  } catch (err) {
    next(err);
  }
};
