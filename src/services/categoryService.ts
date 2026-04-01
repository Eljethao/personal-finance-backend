import { Category } from '../models/Category';
import { CategoryType } from '../types';

export const getCategories = async (userId: string) => {
  return Category.find({ userId }).sort({ type: 1, name: 1 });
};

export const createCategory = async (
  userId: string,
  data: { name: string; icon: string; color: string; type: CategoryType }
) => {
  return Category.create({ userId, ...data, isDefault: false });
};

export const updateCategory = async (
  userId: string,
  categoryId: string,
  data: Partial<{ name: string; icon: string; color: string }>
) => {
  const category = await Category.findOneAndUpdate(
    { _id: categoryId, userId },
    data,
    { new: true }
  );
  if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });
  return category;
};

export const deleteCategory = async (userId: string, categoryId: string) => {
  const category = await Category.findOneAndDelete({ _id: categoryId, userId });
  if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });
};
