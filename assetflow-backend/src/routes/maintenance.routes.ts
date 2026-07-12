import { Router } from 'express';
import * as maint from '../controllers/maintenance.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
router.use(authenticate);

router.get('/', maint.getMaintenanceList);
router.get('/:id', maint.getMaintenance);
router.post('/', upload.array('images', 5), maint.createMaintenance);
router.patch('/:id/approve', authorize('admin', 'asset_manager'), maint.approveMaintenance);
router.patch('/:id/status', authorize('admin', 'asset_manager'), maint.updateMaintenanceStatus);

export default router;
