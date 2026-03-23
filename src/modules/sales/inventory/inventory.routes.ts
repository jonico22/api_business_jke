import { Router } from 'express';
import { getKardex, createAdjustment } from './inventory.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Inventario y Kardex
 * Todas las rutas requieren autenticación
 */

// GET /api/inventory/kardex - Ver Kardex / Historial de Movimientos
router.get('/kardex', auth, getKardex);

// POST /api/inventory/adjustment - Ajuste Manual de Stock
router.post('/adjustment', auth, createAdjustment);

export default router;
