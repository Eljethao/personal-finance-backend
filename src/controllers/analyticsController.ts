import { Response, NextFunction } from 'express';
import * as analyticsService from '../services/analyticsService';
import { AuthRequest } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';

export const getSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : startOfMonth(now);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : endOfMonth(now);
    const data = await analyticsService.getSummary(req.user!.id, startDate, endDate);
    res.json({ success: true, data, message: 'Summary fetched' });
  } catch (err) {
    next(err);
  }
};

export const getByCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : startOfMonth(now);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : endOfMonth(now);
    const data = await analyticsService.getByCategory(
      req.user!.id,
      startDate,
      endDate,
      req.query.type as string
    );
    res.json({ success: true, data, message: 'Category analytics fetched' });
  } catch (err) {
    next(err);
  }
};

export const getMonthly = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();
    const data = await analyticsService.getMonthly(req.user!.id, year);
    res.json({ success: true, data, message: 'Monthly analytics fetched' });
  } catch (err) {
    next(err);
  }
};
