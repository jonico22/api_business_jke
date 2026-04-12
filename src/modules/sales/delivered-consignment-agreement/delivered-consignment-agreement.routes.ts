import express, { Router } from 'express';
import auth from '@/middlewares/auth.middleware';
import {
    createDeliveredConsignmentAgreement,
    deleteDeliveredConsignmentAgreement,
    getDeliveredConsignmentAgreementById,
    getDeliveredConsignmentAgreements,
    updateDeliveredConsignmentAgreement
} from './delivered-consignment-agreement.controller';

const router = Router();

/**
 * Rutas para el módulo de Entregas de Productos en Consignación
 * Todas las rutas requieren autenticación
 */

// GET /api/delivered-consignment-agreements - Listar entregas
router.get('/', auth, getDeliveredConsignmentAgreements);

// GET /api/delivered-consignment-agreements/:id - Obtener entrega por ID
router.get('/:id', auth, getDeliveredConsignmentAgreementById);

// POST /api/delivered-consignment-agreements - Crear entrega
router.post('/', auth, express.json(), createDeliveredConsignmentAgreement);

// PUT /api/delivered-consignment-agreements/:id - Actualizar entrega
router.put('/:id', auth, express.json(), updateDeliveredConsignmentAgreement);

// DELETE /api/delivered-consignment-agreements/:id - Eliminar entrega
router.delete('/:id', auth, deleteDeliveredConsignmentAgreement);

export default router;
