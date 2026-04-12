import express, { Router } from 'express';
import auth from '@/middlewares/auth.middleware';
import {
    createExternalConsignmentSale,
    deleteExternalConsignmentSale,
    getExternalConsignmentSaleById,
    getExternalConsignmentSales,
    updateExternalConsignmentSale
} from './external-consignment-sale.controller';

const router = Router();

/**
 * Rutas para el módulo de Ventas Externas de Consignación
 * Todas las rutas requieren autenticación
 */

// GET /api/external-consignment-sales - Listar ventas
router.get('/', auth, getExternalConsignmentSales);

// GET /api/external-consignment-sales/:id - Obtener venta por ID
router.get('/:id', auth, getExternalConsignmentSaleById);

// POST /api/external-consignment-sales - Crear venta
router.post('/', auth, express.json(), createExternalConsignmentSale);

// PUT /api/external-consignment-sales/:id - Actualizar venta
router.put('/:id', auth, express.json(), updateExternalConsignmentSale);

// DELETE /api/external-consignment-sales/:id - Eliminar venta
router.delete('/:id', auth, deleteExternalConsignmentSale);

export default router;
