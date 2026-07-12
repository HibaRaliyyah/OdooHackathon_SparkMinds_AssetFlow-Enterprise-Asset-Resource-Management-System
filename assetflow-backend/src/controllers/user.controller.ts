import { Request, Response } from 'express';
import User from '../models/User';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, string>);
    const { role, department, isActive, search } = req.query;

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (req.user?.role === 'department_head' && req.user.department) {
      filter.department = req.user.department;
    }

    const [users, total] = await Promise.all([
      User.find(filter).populate('department', 'name code').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    sendSuccess(res, users, 'Users fetched', 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).populate('department');
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, user);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) { sendError(res, 'Email already registered', 409); return; }
    const user = await User.create(req.body);
    sendSuccess(res, user, 'User created', 201);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password, ...updateData } = req.body;
    if (req.file) updateData.avatar = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, user, 'User updated');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) { sendError(res, 'User not found', 404); return; }
    sendSuccess(res, null, 'User deactivated');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;
    const update: Record<string, unknown> = { firstName, lastName, phone };
    if (req.file) update.avatar = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user?.id, update, { new: true }).populate('department');
    sendSuccess(res, user, 'Profile updated');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};
