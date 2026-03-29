import { Router } from 'express';
import {
    openCashShift,
    getAllCashShifts,
    closeCashShift,
    getCashShiftById,
    createManualMovement,
    getCreatedByUsers,
    getCurrentCashShift,
    getCashShiftsForSelect
} from './cash-shift.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Caja / Turnos (Cash Shifts)
 * Todas las rutas requieren autenticación
 */

// GET /api/cash-shifts - Listar turnos de caja
router.get('/', auth, getAllCashShifts);

// GET /api/cash-shifts/current - Consultar estado de caja actual
router.get('/current', auth, getCurrentCashShift);

// GET /api/cash-shifts/select - Turnos para select/dropdown
router.get('/select', auth, getCashShiftsForSelect);

// GET /api/cash-shifts/created-by - Usuarios que han abierto cajas
router.get('/created-by', auth, getCreatedByUsers);

// GET /api/cash-shifts/:id - Detalle de turno de caja
router.get('/:id', auth, getCashShiftById);

// POST /api/cash-shifts/open - Abrir turno de caja
router.post('/open', auth, openCashShift);

// POST /api/cash-shifts/close/:id - Cerrar turno de caja
router.post('/close/:id', auth, closeCashShift);

// POST /api/cash-shifts/movements - Registrar movimiento manual
router.post('/movements', auth, createManualMovement);

export default router;
