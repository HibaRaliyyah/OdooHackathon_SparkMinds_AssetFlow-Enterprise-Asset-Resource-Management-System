import { Router } from 'express';
import * as asset from '../controllers/asset.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', asset.getDashboardStats);
router.get('/', asset.getAssets);
router.get('/:id', asset.getAsset);
router.post('/', authorize('admin', 'asset_manager'), upload.array('images', 5), asset.createAsset);
router.put('/:id', authorize('admin', 'asset_manager'), upload.array('images', 5), asset.updateAsset);
router.delete('/:id', authorize('admin'), asset.deleteAsset);
router.patch('/:id/allocate', authorize('admin', 'asset_manager'), asset.allocateAsset);
router.patch('/:id/return', authorize('admin', 'asset_manager'), asset.returnAsset);

export default router;
