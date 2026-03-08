import { Router } from 'express';
import { getReport } from './report.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Reportes de Ordenes
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/orders/reports - Generar reporte
router.get('/', auth, getReport);

export default router;
