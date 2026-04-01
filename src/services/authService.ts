import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Category } from '../models/Category';
import { Wallet } from '../models/Wallet';

const DEFAULT_CATEGORIES = [
  { name: 'Salary', icon: 'salary', color: '#4CAF50', type: 'income' },
  { name: 'Business', icon: 'business', color: '#2196F3', type: 'income' },
  { name: 'Interest', icon: 'interest', color: '#00BCD4', type: 'income' },
  { name: 'Food', icon: 'food', color: '#FF5722', type: 'expense' },
  { name: 'Utilities', icon: 'utilities', color: '#9C27B0', type: 'expense' },
  { name: 'Transport', icon: 'transport', color: '#FF9800', type: 'expense' },
  { name: 'Shopping', icon: 'shopping', color: '#E91E63', type: 'expense' },
  { name: 'Healthcare', icon: 'healthcare', color: '#F44336', type: 'expense' },
  { name: 'Stocks', icon: 'stocks', color: '#3F51B5', type: 'investment' },
  { name: 'Crypto', icon: 'crypto', color: '#607D8B', type: 'investment' },
  { name: 'Gold', icon: 'gold', color: '#FFC107', type: 'investment' },
  { name: 'Mutual Fund', icon: 'mutual_fund', color: '#795548', type: 'investment' },
];

export const register = async (name: string, phone: string, pin: string) => {
  const existing = await User.findOne({ phone });
  if (existing) {
    throw Object.assign(new Error('Phone number already in use'), { status: 400 });
  }

  const user = await User.create({ name, phone, pin });

  await Category.insertMany(
    DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user._id, isDefault: true }))
  );

  await Wallet.create({ userId: user._id, name: 'Cash', icon: 'cash', currency: 'LAK' });

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
};

export const login = async (phone: string, pin: string) => {
  const user = await User.findOne({ phone });
  if (!user || !(await user.comparePin(pin))) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }
  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId).select('-password -pin');
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return user;
};

const generateToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id.toString(), phone: user.phone },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
  );
};

const sanitizeUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  preferredLanguage: user.preferredLanguage,
});
