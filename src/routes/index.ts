import { Router } from 'express';
import authRoutes from '@/core/auth/auth.routes';
import userRoutes from '@/core/user/user.routes';
import roleRoutes from '@/core/role/role.routes';
import permissionRoutes from '@/core/permission/permission.routes';
import viewRoutes from '@/core/view/view.routes';
import dashboard from '@/core/dashboard/dashboard.routes'

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/views', viewRoutes);
router.use('/dashboard', dashboard);
export default router;
292.08