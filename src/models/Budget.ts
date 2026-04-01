import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBudget extends Document {
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  amount: number;
  month: number;
  year: number;
  createdAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    amount: { type: Number, required: true, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1, year: 1 });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);
