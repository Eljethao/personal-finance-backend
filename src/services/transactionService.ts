import { Transaction } from '../models/Transaction';
import { TransactionType } from '../types';
import { Types } from 'mongoose';
import { getPresignedUrl } from './s3Service';

/** Replace the stored private S3 URL with a 1-hour presigned URL. */
const withPresignedUrl = async (transaction: any): Promise<any> => {
  const obj = transaction.toObject ? transaction.toObject() : { ...transaction };
  if (obj.slipImageUrl) {
    obj.slipImageUrl = await getPresignedUrl(obj.slipImageUrl);
  }
  return obj;
};

interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  walletId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export const getTransactions = async (userId: string, filters: TransactionFilters) => {
  const query: any = { userId: new Types.ObjectId(userId) };

  if (filters.type) query.type = filters.type;
  if (filters.categoryId) query.categoryId = new Types.ObjectId(filters.categoryId);
  if (filters.walletId) query.walletId = new Types.ObjectId(filters.walletId);
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = filters.startDate;
    if (filters.endDate) query.date.$lte = filters.endDate;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const [raw, total] = await Promise.all([
    Transaction.find(query)
      .populate('categoryId', 'name icon color type')
      .populate('walletId', 'name icon currency')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(query),
  ]);

  const transactions = await Promise.all(raw.map(withPresignedUrl));

  return {
    transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const createTransaction = async (
  userId: string,
  data: {
    walletId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    date: Date;
    note?: string;
    slipImageUrl?: string;
  }
) => {
  return Transaction.create({ userId, ...data });
};

export const updateTransaction = async (
  userId: string,
  transactionId: string,
  data: Partial<{
    walletId: string;
    categoryId: string;
    amount: number;
    date: Date;
    note: string;
    slipImageUrl: string;
  }>
) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId },
    data,
    { new: true }
  )
    .populate('categoryId', 'name icon color type')
    .populate('walletId', 'name icon currency');
  if (!transaction) throw Object.assign(new Error('Transaction not found'), { status: 404 });
  return withPresignedUrl(transaction);
};

export const deleteTransaction = async (userId: string, transactionId: string) => {
  const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId });
  if (!transaction) throw Object.assign(new Error('Transaction not found'), { status: 404 });
};
