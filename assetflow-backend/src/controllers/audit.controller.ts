import { Response } from 'express';
import mongoose from 'mongoose';
import Audit from '../models/Audit';
import Asset from '../models/Asset';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const startAudit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, department, scheduledDate } = req.body;
    const filter: Record<string, unknown> = { status: { $ne: 'disposed' } };
    if (department) filter.department = department;
    const totalAssets = await Asset.countDocuments(filter);

    const audit = await Audit.create({
      title, department, scheduledDate,
      conductedBy: req.user?.id,
      status: 'in_progress',
      startedAt: new Date(),
      totalAssets,
    });
    sendSuccess(res, audit, 'Audit started', 201);
  } catch (err: unknown) {
    require('fs').appendFileSync('audit-error.log', (err as Error).stack + '\\n');
    sendError(res, (err as Error).message, 500); 
  }
};

export const getAudits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, string>);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;

    const [audits, total] = await Promise.all([
      Audit.find(filter)
        .populate('department', 'name')
        .populate('conductedBy', 'firstName lastName')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Audit.countDocuments(filter),
    ]);
    sendSuccess(res, audits, 'Audits fetched', 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const scanAsset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assetId, condition, location } = req.body;
    const audit = await Audit.findById(req.params.id);
    if (!audit) { sendError(res, 'Audit not found', 404); return; }

    const isValidObjectId = mongoose.Types.ObjectId.isValid(assetId);
    const query = isValidObjectId ? { $or: [{ assetId }, { _id: assetId }] } : { assetId };
    const asset = await Asset.findOne(query);
    if (!asset) {
      audit.discrepancies.push({ issue: `Asset not found in system: ${assetId}` });
      await audit.save();
      sendError(res, 'Asset not found', 404);
      return;
    }

    audit.scannedAssets += 1;
    const discrepancies: string[] = [];

    if (condition && condition !== asset.condition) {
      discrepancies.push(`Condition mismatch: expected ${asset.condition}, found ${condition}`);
    }
    if (location && location !== asset.location) {
      discrepancies.push(`Location mismatch: expected ${asset.location}, found ${location}`);
    }

    if (discrepancies.length === 0) {
      audit.matchedAssets += 1;
      await Asset.findByIdAndUpdate(asset._id, { lastAuditDate: new Date(), ...(condition && { condition }), ...(location && { location }) });
    } else {
      audit.discrepancies.push({ asset: asset._id as import('mongoose').Types.ObjectId, issue: discrepancies.join('; ') });
    }
    await audit.save();
    sendSuccess(res, { asset, discrepancies }, 'Asset scanned');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const completeAudit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const audit = await Audit.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date(), notes: req.body.notes },
      { new: true }
    );
    if (!audit) { sendError(res, 'Audit not found', 404); return; }
    sendSuccess(res, audit, 'Audit completed');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};
