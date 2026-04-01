import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  phone: string;
  pin: string;
  preferredLanguage: 'en' | 'lo';
  createdAt: Date;
  comparePin(pin: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    pin: { type: String, required: true },
    preferredLanguage: { type: String, enum: ['en', 'lo'], default: 'en' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('pin')) {
    this.pin = await bcrypt.hash(this.pin, 12);
  }
  next();
});

userSchema.methods.comparePin = async function (pin: string): Promise<boolean> {
  return bcrypt.compare(pin, this.pin);
};

export const User = mongoose.model<IUser>('User', userSchema);
