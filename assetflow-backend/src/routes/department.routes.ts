import { Router } from 'express';
import * as dept from '../controllers/department.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', dept.getDepartments);
router.get('/:id', dept.getDepartment);
router.post('/', authorize('admin'), dept.createDepartment);
router.put('/:id', authorize('admin'), dept.updateDepartment);
router.delete('/:id', authorize('admin'), dept.deleteDepartment);

export default router;
