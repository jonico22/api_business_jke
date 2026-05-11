import express, { Router } from 'express';
import auth from '@/middlewares/auth.middleware';
import {
    createOutgoingConsignmentAgreement,
    deleteOutgoingConsignmentAgreement,
    getOutgoingConsignmentAgreementById,
    getOutgoingConsignmentAgreements,
    updateOutgoingConsignmentAgreement
} from './outgoing-consignment-agreement.controller';

const router = Router();

/**
 * Rutas para el módulo de Acuerdos de Consignación Saliente
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/outgoing-consignment-agreements - Listar acuerdos
router.get('/', auth, getOutgoingConsignmentAgreements);

// GET /api/sales/outgoing-consignment-agreements/:id - Obtener acuerdo por ID
router.get('/:id', auth, getOutgoingConsignmentAgreementById);

// POST /api/sales/outgoing-consignment-agreements - Crear acuerdo
router.post('/', auth, express.json(), createOutgoingConsignmentAgreement);

// PUT /api/sales/outgoing-consignment-agreements/:id - Actualizar acuerdo
router.put('/:id', auth, express.json(), updateOutgoingConsignmentAgreement);

// DELETE /api/sales/outgoing-consignment-agreements/:id - Eliminar acuerdo
router.delete('/:id', auth, deleteOutgoingConsignmentAgreement);

export default router;
