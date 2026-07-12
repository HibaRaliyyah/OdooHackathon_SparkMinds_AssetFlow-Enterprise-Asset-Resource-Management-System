import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Asset from '../models/Asset';
import Notification from '../models/Notification';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { asset, startTime, endTime, purpose } = req.body;

    // Check conflict
    const conflict = await Booking.findOne({
      asset,
      status: { $in: ['approved', 'pending'] },
      $or: [
        { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } },
      ],
    });
    if (conflict) {
      sendError(res, 'Asset is already booked for this time slot', 409);
      return;
    }

    const booking = await Booking.create({
      asset, startTime, endTime, purpose,
      bookedBy: req.user?.id,
      department: req.user?.department,
    });

    await booking.populate([
      { path: 'asset', select: 'name assetId' },
      { path: 'bookedBy', select: 'firstName lastName' },
    ]);

    sendSuccess(res, booking, 'Booking created', 201);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, string>);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.asset) filter.asset = req.query.asset;
    if (req.user?.role === 'employee') filter.bookedBy = req.user.id;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('asset', 'name assetId')
        .populate('bookedBy', 'firstName lastName employeeId avatar')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments(filter),
    ]);
    sendSuccess(res, bookings, 'Bookings fetched', 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const approveBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) { sendError(res, 'Booking not found', 404); return; }

    booking.status = 'approved';
    booking.approvedBy = req.user?.id as unknown as import('mongoose').Types.ObjectId;
    booking.approvedAt = new Date();
    await booking.save();

    await Notification.create({
      recipient: booking.bookedBy,
      title: 'Booking Approved',
      message: 'Your resource booking has been approved.',
      type: 'success', category: 'booking',
    });

    sendSuccess(res, booking, 'Booking approved');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const rejectBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason, approvedBy: req.user?.id, approvedAt: new Date() },
      { new: true }
    );
    if (!booking) { sendError(res, 'Booking not found', 404); return; }
    sendSuccess(res, booking, 'Booking rejected');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, bookedBy: req.user?.id });
    if (!booking) { sendError(res, 'Booking not found', 404); return; }
    booking.status = 'cancelled';
    await booking.save();
    sendSuccess(res, booking, 'Booking cancelled');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};
