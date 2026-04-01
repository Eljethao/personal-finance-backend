import { Response, NextFunction } from 'express';
import * as transactionService from '../services/transactionService';
import * as s3Service from '../services/s3Service';
import { AuthRequest } from '../types';

export const getTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, categoryId, walletId, startDate, endDate, page, limit } = req.query;
    const result = await transactionService.getTransactions(req.user!.id, {
      type: type as any,
      categoryId: categoryId as string,
      walletId: walletId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json({ success: true, data: result, message: 'Transactions fetched' });
  } catch (err) {
    next(err);
  }
};

export const createTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transaction = await transactionService.createTransaction(req.user!.id, req.body);
    res.status(201).json({ success: true, data: transaction, message: 'Transaction created' });
  } catch (err) {
    next(err);
  }
};

export const updateTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transaction = await transactionService.updateTransaction(
      req.user!.id,
      req.params.id,
      req.body
    );
    res.json({ success: true, data: transaction, message: 'Transaction updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await transactionService.deleteTransaction(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};

export const uploadSlip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    const url = await s3Service.uploadSlipImage(req.file, req.user!.id);
    res.json({ success: true, data: { url }, message: 'Slip uploaded successfully' });
  } catch (err) {
    next(err);
  }
};
