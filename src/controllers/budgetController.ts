import { Response, NextFunction } from 'express';
import * as budgetService from '../services/budgetService';
import { AuthRequest } from '../types';

export const getBudgets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const budgets = await budgetService.getBudgets(req.user!.id);
    res.json({ success: true, data: budgets, message: 'Budgets fetched' });
  } catch (err) {
    next(err);
  }
};

export const createBudget = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const budget = await budgetService.createBudget(req.user!.id, req.body);
    res.status(201).json({ success: true, data: budget, message: 'Budget created' });
  } catch (err) {
    next(err);
  }
};

export const updateBudget = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const budget = await budgetService.updateBudget(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: budget, message: 'Budget updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteBudget = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await budgetService.deleteBudget(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
};

export const getBudgetStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const status = await budgetService.getBudgetStatus(req.user!.id);
    res.json({ success: true, data: status, message: 'Budget status fetched' });
  } catch (err) {
    next(err);
  }
};
