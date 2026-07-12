import { Router } from 'express';
import * as user from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorize('admin', 'asset_manager', 'department_head'), user.getUsers);
router.get('/:id', user.getUser);
router.post('/', authorize('admin'), user.createUser);
router.put('/profile', upload.single('avatar'), user.updateProfile);
router.put('/:id', authorize('admin'), upload.single('avatar'), user.updateUser);
router.delete('/:id', authorize('admin'), user.deleteUser);

export default router;
