import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query as Record<string, string>);
    const filter: Record<string, unknown> = { recipient: req.user?.id };
    if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user?.id, isRead: false }),
    ]);

    sendSuccess(res, { notifications, unreadCount }, 'Notifications fetched', 200, {
      page, limit, total, pages: Math.ceil(total / limit),
    });
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user?.id },
      { isRead: true, readAt: new Date() }
    );
    sendSuccess(res, null, 'Marked as read');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ recipient: req.user?.id, isRead: false }, { isRead: true, readAt: new Date() });
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};
