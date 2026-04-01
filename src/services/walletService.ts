import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { Types } from 'mongoose';

export const getWallets = async (userId: string) => {
  const wallets = await Wallet.find({ userId }).lean();
  const walletsWithBalance = await Promise.all(
    wallets.map(async (wallet) => {
      const balance = await calculateWalletBalance(userId, wallet._id.toString());
      return { ...wallet, balance: balance + (wallet.initialBalance ?? 0) };
    })
  );
  return walletsWithBalance;
};

export const calculateWalletBalance = async (
  userId: string,
  walletId: string
): Promise<number> => {
  const result = await Transaction.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        walletId: new Types.ObjectId(walletId),
      },
    },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  let balance = 0;
  result.forEach((r) => {
    if (r._id === 'income') balance += r.total;
    else if (r._id === 'expense') balance -= r.total;
    else if (r._id === 'investment') balance -= r.total;
  });
  return balance;
};

export const createWallet = async (
  userId: string,
  data: { name: string; icon: string; currency?: string; initialBalance?: number }
) => {
  return Wallet.create({ userId, currency: 'LAK', initialBalance: 0, ...data });
};

export const updateWallet = async (
  userId: string,
  walletId: string,
  data: Partial<{ name: string; icon: string; currency: string }>
) => {
  const wallet = await Wallet.findOneAndUpdate({ _id: walletId, userId }, data, { new: true });
  if (!wallet) throw Object.assign(new Error('Wallet not found'), { status: 404 });
  return wallet;
};

export const deleteWallet = async (userId: string, walletId: string) => {
  const wallet = await Wallet.findOneAndDelete({ _id: walletId, userId });
  if (!wallet) throw Object.assign(new Error('Wallet not found'), { status: 404 });
};
