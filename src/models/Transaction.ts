import mongoose, { Document, Schema, Types } from 'mongoose';
import { TransactionType } from '../types';

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  walletId: Types.ObjectId;
  categoryId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  date: Date;
  note?: string;
  slipImageUrl?: string;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    type: { type: String, enum: ['income', 'expense', 'investment'], required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    note: { type: String, trim: true },
    slipImageUrl: { type: String },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, categoryId: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
