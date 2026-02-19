import { Router } from 'express';
import isAuth from '@/middlewares/auth.middleware';
import { getDashboardStats } from './sales-dashboard.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(isAuth);

router.get('/stats', getDashboardStats);

export default router;
