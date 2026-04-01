import { Response, NextFunction } from 'express';
import * as exportService from '../services/exportService';
import { AuthRequest } from '../types';

export const exportExcel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, type, categoryId } = req.query;
    const buffer = await exportService.exportExcel(req.user!.id, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: type as string,
      categoryId: categoryId as string,
    });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

export const exportPdf = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, type, categoryId } = req.query;
    const buffer = await exportService.exportPdf(req.user!.id, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: type as string,
      categoryId: categoryId as string,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
