import { Budget } from '../models/Budget';
import { Transaction } from '../models/Transaction';
import { Types } from 'mongoose';

export const getBudgets = async (userId: string) => {
  return Budget.find({ userId }).populate('categoryId', 'name icon color');
};

export const createBudget = async (
  userId: string,
  data: { categoryId: string; amount: number; month: number; year: number }
) => {
  const existing = await Budget.findOne({
    userId,
    categoryId: data.categoryId,
    month: data.month,
    year: data.year,
  });
  if (existing) {
    throw Object.assign(
      new Error('Budget already exists for this category and period'),
      { status: 400 }
    );
  }
  return Budget.create({ userId, ...data });
};

export const updateBudget = async (
  userId: string,
  budgetId: string,
  data: Partial<{ amount: number; month: number; year: number }>
) => {
  const budget = await Budget.findOneAndUpdate({ _id: budgetId, userId }, data, {
    new: true,
  }).populate('categoryId', 'name icon color');
  if (!budget) throw Object.assign(new Error('Budget not found'), { status: 404 });
  return budget;
};

export const deleteBudget = async (userId: string, budgetId: string) => {
  const budget = await Budget.findOneAndDelete({ _id: budgetId, userId });
  if (!budget) throw Object.assign(new Error('Budget not found'), { status: 404 });
};

export const getBudgetStatus = async (userId: string) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const budgets = await Budget.find({ userId, month, year }).populate(
    'categoryId',
    'name icon color'
  );

  const statuses = await Promise.all(
    budgets.map(async (budget) => {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const spentResult = await Transaction.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            categoryId: (budget.categoryId as any)._id,
            type: 'expense',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = spentResult[0]?.total || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const status = percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok';

      return {
        budget,
        spent,
        remaining: Math.max(0, budget.amount - spent),
        percentage: Math.min(100, percentage),
        status,
      };
    })
  );

  return statuses;
};
