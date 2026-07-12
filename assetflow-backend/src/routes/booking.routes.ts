import { Router } from 'express';
import * as booking from '../controllers/booking.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', booking.getBookings);
router.post('/', booking.createBooking);
router.patch('/:id/approve', authorize('admin', 'asset_manager', 'department_head'), booking.approveBooking);
router.patch('/:id/reject', authorize('admin', 'asset_manager', 'department_head'), booking.rejectBooking);
router.patch('/:id/cancel', booking.cancelBooking);

export default router;
