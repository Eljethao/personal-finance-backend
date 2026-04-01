import { Response, NextFunction } from 'express';
import * as categoryService from '../services/categoryService';
import { AuthRequest } from '../types';

export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await categoryService.getCategories(req.user!.id);
    res.json({ success: true, data: categories, message: 'Categories fetched' });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await categoryService.createCategory(req.user!.id, req.body);
    res.status(201).json({ success: true, data: category, message: 'Category created' });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await categoryService.updateCategory(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: category, message: 'Category updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await categoryService.deleteCategory(req.user!.id, req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
