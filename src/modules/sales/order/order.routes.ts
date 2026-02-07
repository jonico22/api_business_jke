import { Router } from 'express';
import {
    getAllOrders,
    getOrdersForSelect,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getUpdatedByUsers,
    getCreatedByUsers
} from './order.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Ordenes
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/orders - Obtener todas las ordenes
router.get('/', auth, getAllOrders);

// GET /api/sales/orders/select - Obtener ordenes para select/dropdown
router.get('/select', auth, getOrdersForSelect);

// GET /api/sales/orders/created-by-users - Obtener usuarios que han creado ordenes
router.get('/created-by-users', auth, getCreatedByUsers);

// GET /api/sales/orders/updated-by-users - Obtener usuarios que han actualizado ordenes
router.get('/updated-by-users', auth, getUpdatedByUsers);

// GET /api/sales/orders/:id - Obtener una orden por ID
router.get('/:id', auth, getOrderById);

// POST /api/sales/orders - Crear una nueva orden
router.post('/', auth, createOrder);

// PUT /api/sales/orders/:id - Actualizar una orden
router.put('/:id', auth, updateOrder);

// DELETE /api/sales/orders/:id - Eliminar una orden
router.delete('/:id', auth, deleteOrder);

export default router;
