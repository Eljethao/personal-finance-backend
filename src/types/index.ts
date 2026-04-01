import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
}

export type TransactionType = 'income' | 'expense' | 'investment';
export type CategoryType = 'income' | 'expense' | 'investment';
