import { Router } from 'express';
import {
    getAllOrderPayments,
    getOrderPaymentById,
    createOrderPayment,
    updateOrderPayment,
    deleteOrderPayment,
    getUpdatedByUsers,
    getCreatedByUsers,
    getOrderPaymentsByOrderId
} from './order-payment.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Pagos de Ordenes
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/order-payments - Obtener todos los pagos de ordenes
router.get('/', auth, getAllOrderPayments);

// GET /api/sales/order-payments/by-order/:orderId - Obtener pagos por orden
router.get('/by-order/:orderId', auth, getOrderPaymentsByOrderId);

// GET /api/sales/order-payments/created-by-users - Obtener usuarios que han creado pagos de orden
router.get('/created-by-users', auth, getCreatedByUsers);

// GET /api/sales/order-payments/updated-by-users - Obtener usuarios que han actualizado pagos de orden
router.get('/updated-by-users', auth, getUpdatedByUsers);

// GET /api/sales/order-payments/:id - Obtener un pago de orden por ID
router.get('/:id', auth, getOrderPaymentById);

// POST /api/sales/order-payments - Crear un nuevo pago de orden
router.post('/', auth, createOrderPayment);

// PUT /api/sales/order-payments/:id - Actualizar un pago de orden
router.put('/:id', auth, updateOrderPayment);

// DELETE /api/sales/order-payments/:id - Eliminar un pago de orden
router.delete('/:id', auth, deleteOrderPayment);

export default router;
