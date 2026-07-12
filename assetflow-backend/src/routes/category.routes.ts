import { Router } from 'express';
import * as cat from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', cat.getCategories);
router.post('/', authorize('admin', 'asset_manager'), cat.createCategory);
router.put('/:id', authorize('admin', 'asset_manager'), cat.updateCategory);
router.delete('/:id', authorize('admin'), cat.deleteCategory);

export default router;
