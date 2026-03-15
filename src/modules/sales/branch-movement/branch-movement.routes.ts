import { Router } from 'express';
import {
    getBranchMovements,
    createBranchMovement,
    updateBranchMovement,
    createBulkTransfer,
    transferAll
} from './branch-movement.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Movimientos entre Sucursales (Internal Transfers)
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/branch-movements - Listar movimientos (Paginado)
router.get('/', auth, getBranchMovements);

// POST /api/sales/branch-movements - Crear traslado (Paso 1: Reserva)
router.post('/', auth, createBranchMovement);

// POST /api/sales/branch-movements/bulk - Traslado en bloque
router.post('/bulk', auth, createBulkTransfer);

// POST /api/sales/branch-movements/transfer-all - Traslado total de almacén
router.post('/transfer-all', auth, transferAll);

// PUT /api/sales/branch-movements/:id - Confirmar o Cancelar traslado
router.put('/:id', auth, updateBranchMovement);

export default router;
