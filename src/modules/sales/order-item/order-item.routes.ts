import { Router } from 'express';
import {
    getAllOrderItems,
    getOrderItemsForSelect,
    getOrderItemById,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem,
    getUpdatedByUsers,
    getCreatedByUsers
} from './order-item.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Items de Ordenes
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/order-items - Obtener todos los items de ordenes
router.get('/', auth, getAllOrderItems);

// GET /api/sales/order-items/select - Obtener items de orden para select/dropdown
router.get('/select', auth, getOrderItemsForSelect);

// GET /api/sales/order-items/created-by-users - Obtener usuarios que han creado items de orden
router.get('/created-by-users', auth, getCreatedByUsers);

// GET /api/sales/order-items/updated-by-users - Obtener usuarios que han actualizado items de orden
router.get('/updated-by-users', auth, getUpdatedByUsers);

// GET /api/sales/order-items/:id - Obtener un item de orden por ID
router.get('/:id', auth, getOrderItemById);

// POST /api/sales/order-items - Crear un nuevo item de orden
router.post('/', auth, createOrderItem);

// PUT /api/sales/order-items/:id - Actualizar un item de orden
router.put('/:id', auth, updateOrderItem);

// DELETE /api/sales/order-items/:id - Eliminar un item de orden
router.delete('/:id', auth, deleteOrderItem);

export default router;
