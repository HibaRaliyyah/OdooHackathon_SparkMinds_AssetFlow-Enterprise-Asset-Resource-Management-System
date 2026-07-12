import { Request, Response } from 'express';
import Department from '../models/Department';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response.util';

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('manager', 'firstName lastName email avatar');
    
    // Add employee count
    const result = await Promise.all(
      departments.map(async (dept) => {
        const count = await User.countDocuments({ department: dept._id, isActive: true });
        return { ...dept.toJSON(), employeeCount: count };
      })
    );
    sendSuccess(res, result);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const getDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const dept = await Department.findById(req.params.id).populate('manager', 'firstName lastName email');
    if (!dept) { sendError(res, 'Department not found', 404); return; }
    const employeeCount = await User.countDocuments({ department: dept._id, isActive: true });
    sendSuccess(res, { ...dept.toJSON(), employeeCount });
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Department.findOne({ $or: [{ name: req.body.name }, { code: req.body.code }] });
    if (existing) { sendError(res, 'Department name or code already exists', 409); return; }
    const dept = await Department.create(req.body);
    sendSuccess(res, dept, 'Department created', 201);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) { sendError(res, 'Department not found', 404); return; }
    sendSuccess(res, dept, 'Department updated');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!dept) { sendError(res, 'Department not found', 404); return; }
    sendSuccess(res, null, 'Department deactivated');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};
