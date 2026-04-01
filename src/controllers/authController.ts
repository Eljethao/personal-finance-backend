import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, pin } = req.body;
    const result = await authService.register(name, phone, pin);
    res.status(201).json({ success: true, data: result, message: 'User registered successfully' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, pin } = req.body;
    console.log('Login attempt with phone:', phone);
    const result = await authService.login(phone, pin);
    res.json({ success: true, data: result, message: 'Login successful' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({ success: true, data: user, message: 'User fetched' });
  } catch (err) {
    next(err);
  }
};
