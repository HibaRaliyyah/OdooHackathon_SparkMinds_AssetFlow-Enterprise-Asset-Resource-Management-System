import { Router } from 'express';
import * as notif from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', notif.getNotifications);
router.patch('/:id/read', notif.markAsRead);
router.patch('/mark-all-read', notif.markAllAsRead);

export default router;
