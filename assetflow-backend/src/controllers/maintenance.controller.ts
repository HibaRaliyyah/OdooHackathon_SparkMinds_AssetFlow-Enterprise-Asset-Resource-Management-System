import { Request, Response } from 'express';
import Maintenance from '../models/Maintenance';
import Asset from '../models/Asset';
import Notification from '../models/Notification';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createMaintenance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const images = files ? files.map(f => `/uploads/${f.filename}`) : [];

    const maintenance = await Maintenance.create({
      ...req.body,
      images,
      reportedBy: req.user?.id,
    });

    // Update asset status
    await Asset.findByIdAndUpdate(req.body.asset, { status: 'under_maintenance' });

    await maintenance.populate([
      { path: 'asset', select: 'name assetId' },
      { path: 'reportedBy', select: 'firstName lastName' },
    ]);

    sendSuccess(res, maintenance, 'Maintenance request created', 201);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const getMaintenanceList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, string>);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.user?.role === 'employee') filter.reportedBy = req.user.id;

    const [items, total] = await Promise.all([
      Maintenance.find(filter)
        .populate('asset', 'name assetId category')
        .populate('reportedBy', 'firstName lastName avatar')
        .populate('assignedTo', 'firstName lastName')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Maintenance.countDocuments(filter),
    ]);
    sendSuccess(res, items, 'Maintenance list fetched', 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const getMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Maintenance.findById(req.params.id)
      .populate('asset')
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');
    if (!item) { sendError(res, 'Maintenance record not found', 404); return; }
    sendSuccess(res, item);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const approveMaintenance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignedTo } = req.body;
    const item = await Maintenance.findById(req.params.id);
    if (!item) { sendError(res, 'Record not found', 404); return; }

    item.status = 'approved';
    item.approvedBy = req.user?.id as unknown as import('mongoose').Types.ObjectId;
    item.approvedAt = new Date();
    if (assignedTo) item.assignedTo = assignedTo;
    await item.save();

    await Notification.create({
      recipient: item.reportedBy,
      title: 'Maintenance Approved',
      message: `Your maintenance request ${item.maintenanceId} has been approved.`,
      type: 'success', category: 'maintenance',
    });

    sendSuccess(res, item, 'Maintenance approved');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const updateMaintenanceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, diagnosis, resolution, actualCost } = req.body;
    const item = await Maintenance.findById(req.params.id);
    if (!item) { sendError(res, 'Record not found', 404); return; }

    item.status = status;
    if (diagnosis) item.diagnosis = diagnosis;
    if (resolution) item.resolution = resolution;
    if (actualCost) item.actualCost = actualCost;
    if (status === 'in_progress') item.startedAt = new Date();
    if (status === 'completed') {
      item.completedAt = new Date();
      await Asset.findByIdAndUpdate(item.asset, { status: 'available', lastAuditDate: new Date() });
    }
    await item.save();
    sendSuccess(res, item, 'Status updated');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};
