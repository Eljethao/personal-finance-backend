import { Transaction } from '../models/Transaction';
import { Types } from 'mongoose';

export const getSummary = async (userId: string, startDate: Date, endDate: Date) => {
  const result = await Transaction.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = {
    income: 0,
    expense: 0,
    investment: 0,
    incomeCount: 0,
    expenseCount: 0,
    investmentCount: 0,
  };
  result.forEach((r) => {
    if (r._id === 'income') {
      summary.income = r.total;
      summary.incomeCount = r.count;
    } else if (r._id === 'expense') {
      summary.expense = r.total;
      summary.expenseCount = r.count;
    } else if (r._id === 'investment') {
      summary.investment = r.total;
      summary.investmentCount = r.count;
    }
  });

  const recentTransactions = await Transaction.find({
    userId: new Types.ObjectId(userId),
    date: { $gte: startDate, $lte: endDate },
  })
    .populate('categoryId', 'name icon color type')
    .populate('walletId', 'name icon currency')
    .sort({ date: -1 })
    .limit(10);

  return {
    ...summary,
    netBalance: summary.income - summary.expense - summary.investment,
    recentTransactions,
  };
};

export const getByCategory = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  type?: string
) => {
  const matchStage: any = {
    userId: new Types.ObjectId(userId),
    date: { $gte: startDate, $lte: endDate },
  };
  if (type) matchStage.type = type;

  return Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$categoryId',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        category: { _id: 1, name: 1, icon: 1, color: 1, type: 1 },
        total: 1,
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);
};

export const getMonthly = async (userId: string, year: number) => {
  return Transaction.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        date: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31, 23, 59, 59),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    {
      $group: {
        _id: '$_id.month',
        data: { $push: { type: '$_id.type', total: '$total' } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};
