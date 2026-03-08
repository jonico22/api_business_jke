import { Router } from 'express';
import {
    getAllCurrencies,
    getCurrenciesForSelect,
    getCurrencyById,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    getUpdatedByUsers,
    getCreatedByUsers
} from './currency.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Monedas
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/currencies - Obtener todas las monedas
router.get('/', auth, getAllCurrencies);

// GET /api/sales/currencies/select - Obtener monedas para select/dropdown
router.get('/select', auth, getCurrenciesForSelect);

// GET /api/sales/currencies/created-by-users - Obtener usuarios que han creado monedas
router.get('/created-by-users', auth, getCreatedByUsers);

// GET /api/sales/currencies/updated-by-users - Obtener usuarios que han actualizado monedas
router.get('/updated-by-users', auth, getUpdatedByUsers);

// GET /api/sales/currencies/:id - Obtener una moneda por ID
router.get('/:id', auth, getCurrencyById);

// POST /api/sales/currencies - Crear una nueva moneda
router.post('/', auth, createCurrency);

// PUT /api/sales/currencies/:id - Actualizar una moneda
router.put('/:id', auth, updateCurrency);

// DELETE /api/sales/currencies/:id - Eliminar una moneda
router.delete('/:id', auth, deleteCurrency);

export default router;
