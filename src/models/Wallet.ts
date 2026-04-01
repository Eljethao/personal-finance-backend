import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWallet extends Document {
  userId: Types.ObjectId;
  name: string;
  icon: string;
  currency: string;
  initialBalance: number;
  createdAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true },
    currency: { type: String, default: 'LAK' },
    initialBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);
