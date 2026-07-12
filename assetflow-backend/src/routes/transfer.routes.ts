import { Router } from 'express';
import * as transfer from '../controllers/transfer.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', transfer.getTransfers);
router.post('/', transfer.requestTransfer);
router.patch('/:id/approve', authorize('admin', 'asset_manager', 'department_head'), transfer.approveTransfer);
router.patch('/:id/reject', authorize('admin', 'asset_manager', 'department_head'), transfer.rejectTransfer);

export default router;
