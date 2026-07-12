import { Router } from 'express';
import * as audit from '../controllers/audit.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', audit.getAudits);
router.post('/', authorize('admin', 'asset_manager'), audit.startAudit);
router.post('/:id/scan', authorize('admin', 'asset_manager'), audit.scanAsset);
router.patch('/:id/complete', authorize('admin', 'asset_manager'), audit.completeAudit);

export default router;
