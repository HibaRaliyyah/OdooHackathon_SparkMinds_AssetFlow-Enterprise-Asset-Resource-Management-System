import { Request, Response } from 'express';
import Transfer from '../models/Transfer';
import Asset from '../models/Asset';
import Notification from '../models/Notification';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const requestTransfer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transfer = await Transfer.create({ ...req.body, requestedBy: req.user?.id });
    sendSuccess(res, transfer, 'Transfer requested', 201);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const getTransfers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, string>);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.user?.role === 'employee') filter.requestedBy = req.user.id;

    const [transfers, total] = await Promise.all([
      Transfer.find(filter)
        .populate('asset', 'name assetId')
        .populate('fromDepartment', 'name')
        .populate('toDepartment', 'name')
        .populate('fromUser', 'firstName lastName')
        .populate('toUser', 'firstName lastName')
        .populate('requestedBy', 'firstName lastName')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transfer.countDocuments(filter),
    ]);
    sendSuccess(res, transfers, 'Transfers fetched', 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const approveTransfer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) { sendError(res, 'Transfer not found', 404); return; }

    transfer.status = 'approved';
    transfer.approvedBy = req.user?.id as unknown as import('mongoose').Types.ObjectId;
    transfer.approvedAt = new Date();
    await transfer.save();

    // Update asset
    const update: Record<string, unknown> = {};
    if (transfer.toDepartment) update.department = transfer.toDepartment;
    if (transfer.toUser) update.assignedTo = transfer.toUser;
    await Asset.findByIdAndUpdate(transfer.asset, update);

    await Notification.create({
      recipient: transfer.requestedBy,
      title: 'Transfer Approved',
      message: `Your transfer request ${transfer.transferId} has been approved.`,
      type: 'success', category: 'transfer',
    });

    sendSuccess(res, transfer, 'Transfer approved');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const rejectTransfer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const transfer = await Transfer.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', notes: reason, approvedBy: req.user?.id, approvedAt: new Date() },
      { new: true }
    );
    if (!transfer) { sendError(res, 'Transfer not found', 404); return; }
    sendSuccess(res, transfer, 'Transfer rejected');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};
