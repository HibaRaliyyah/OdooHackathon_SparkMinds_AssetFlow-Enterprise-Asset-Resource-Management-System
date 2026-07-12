import { Request, Response } from 'express';
import AssetCategory from '../models/AssetCategory';
import { sendSuccess, sendError } from '../utils/response.util';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await AssetCategory.find({ isActive: true }).sort({ name: 1 });
    sendSuccess(res, categories);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const cat = await AssetCategory.create(req.body);
    sendSuccess(res, cat, 'Category created', 201);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const cat = await AssetCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) { sendError(res, 'Category not found', 404); return; }
    sendSuccess(res, cat, 'Category updated');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await AssetCategory.findByIdAndUpdate(req.params.id, { isActive: false });
    sendSuccess(res, null, 'Category deactivated');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};
