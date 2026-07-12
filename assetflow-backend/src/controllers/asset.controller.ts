import { Request, Response } from 'express';
import Asset from '../models/Asset';
import Booking from '../models/Booking';
import Maintenance from '../models/Maintenance';
import Transfer from '../models/Transfer';
import ActivityLog from '../models/ActivityLog';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response.util';
import QRCode from 'qrcode';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createAsset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const images = files ? files.map(f => `/uploads/${f.filename}`) : [];

    const asset = await Asset.create({
      ...req.body,
      images,
      createdBy: req.user?.id,
    });

    // Generate QR code
    const qrData = JSON.stringify({ assetId: asset.assetId, id: asset._id });
    const qrCode = await QRCode.toDataURL(qrData);
    asset.qrCode = qrCode;
    await asset.save();

    await ActivityLog.create({
      action: 'ASSET_CREATED', entity: 'Asset', entityId: asset._id,
      performedBy: req.user?.id, ipAddress: req.ip,
      description: `Asset ${asset.assetId} - ${asset.name} created`,
      newValue: { assetId: asset.assetId, name: asset.name },
    });

    sendSuccess(res, asset, 'Asset created successfully', 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const getAssets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, string>);
    const { status, category, department, condition, search } = req.query;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (condition) filter.condition = condition;
    if (search) filter.$text = { $search: search as string };

    // Employees only see their own assets
    if (req.user?.role === 'employee') {
      filter.assignedTo = req.user.id;
    }
    // Department heads see their department assets
    if (req.user?.role === 'department_head' && req.user.department) {
      filter.department = req.user.department;
    }

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .populate('category', 'name code color icon')
        .populate('department', 'name code')
        .populate('assignedTo', 'firstName lastName employeeId avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Asset.countDocuments(filter),
    ]);

    sendSuccess(res, assets, 'Assets fetched', 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const getAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('category')
      .populate('department', 'name code')
      .populate('assignedTo', 'firstName lastName employeeId avatar email')
      .populate('createdBy', 'firstName lastName');

    if (!asset) { sendError(res, 'Asset not found', 404); return; }
    sendSuccess(res, asset);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const updateAsset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const old = await Asset.findById(req.params.id);
    if (!old) { sendError(res, 'Asset not found', 404); return; }

    const files = req.files as Express.Multer.File[];
    const newImages = files ? files.map(f => `/uploads/${f.filename}`) : [];
    if (newImages.length > 0) req.body.images = [...(old.images || []), ...newImages];

    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await ActivityLog.create({
      action: 'ASSET_UPDATED', entity: 'Asset', entityId: old._id,
      performedBy: req.user?.id, ipAddress: req.ip,
      description: `Asset ${old.assetId} updated`,
      oldValue: { status: old.status, condition: old.condition },
      newValue: { status: req.body.status, condition: req.body.condition },
    });

    sendSuccess(res, asset, 'Asset updated');
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const deleteAsset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) { sendError(res, 'Asset not found', 404); return; }
    await ActivityLog.create({
      action: 'ASSET_DELETED', entity: 'Asset', entityId: asset._id,
      performedBy: req.user?.id, description: `Asset ${asset.assetId} deleted`,
    });
    sendSuccess(res, null, 'Asset deleted');
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const allocateAsset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) { sendError(res, 'Asset not found', 404); return; }
    if (asset.status !== 'available') { sendError(res, 'Asset is not available for allocation', 400); return; }

    asset.assignedTo = userId;
    asset.status = 'allocated';
    await asset.save();

    await ActivityLog.create({
      action: 'ASSET_ALLOCATED', entity: 'Asset', entityId: asset._id,
      performedBy: req.user?.id, description: `Asset ${asset.assetId} allocated to user ${userId}`,
    });
    sendSuccess(res, asset, 'Asset allocated successfully');
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const returnAsset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) { sendError(res, 'Asset not found', 404); return; }
    asset.assignedTo = undefined;
    asset.status = 'available';
    await asset.save();
    sendSuccess(res, asset, 'Asset returned successfully');
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.user?.role === 'department_head' && req.user.department) {
      filter.department = req.user.department;
    }

    const [total, available, allocated, underMaintenance, disposed, pending] = await Promise.all([
      Asset.countDocuments(filter),
      Asset.countDocuments({ ...filter, status: 'available' }),
      Asset.countDocuments({ ...filter, status: 'allocated' }),
      Asset.countDocuments({ ...filter, status: 'under_maintenance' }),
      Asset.countDocuments({ ...filter, status: 'disposed' }),
      Maintenance.countDocuments({ status: 'pending' }),
    ]);

    // Category distribution
    const categoryDist = await Asset.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'assetcategories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$cat.name', 'Unknown'] }, count: 1, color: '$cat.color' } },
    ]);

    // Department usage
    const deptUsage = await Asset.aggregate([
      { $match: filter },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$dept.name', 'Unknown'] }, count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Recent logs
    const recentActivity = await ActivityLog.find()
      .populate('performedBy', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly Growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const prevAssetsCount = await Asset.countDocuments({ ...filter, createdAt: { $lt: sixMonthsAgo } });

    const monthlyData = await Asset.aggregate([
      { $match: { ...filter, createdAt: { $gte: sixMonthsAgo } } },
      { 
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const assetGrowth = [];
    
    let cumulative = prevAssetsCount;
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1; // 1-12
      const y = d.getFullYear();
      
      const found = monthlyData.find(x => x._id.month === m && x._id.year === y);
      cumulative += (found ? found.count : 0);
      
      assetGrowth.push({
        month: monthNames[m - 1],
        assets: cumulative
      });
    }

    sendSuccess(res, {
      stats: { total, available, allocated, underMaintenance, disposed, pendingRequests: pending },
      categoryDistribution: categoryDist,
      departmentUsage: deptUsage,
      assetGrowth,
      recentActivity,
    });
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};
