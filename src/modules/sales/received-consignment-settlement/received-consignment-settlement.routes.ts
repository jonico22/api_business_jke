import express, { Router } from 'express';
import auth from '@/middlewares/auth.middleware';
import {
    createReceivedConsignmentSettlement,
    deleteReceivedConsignmentSettlement,
    getReceivedConsignmentSettlementById,
    getReceivedConsignmentSettlements,
    updateReceivedConsignmentSettlement
} from './received-consignment-settlement.controller';

const router = Router();

/**
 * Rutas para el módulo de Liquidaciones Recibidas de Consignación
 * Todas las rutas requieren autenticación
 */

// GET /api/received-consignment-settlements - Listar liquidaciones
router.get('/', auth, getReceivedConsignmentSettlements);

// GET /api/received-consignment-settlements/:id - Obtener liquidación por ID
router.get('/:id', auth, getReceivedConsignmentSettlementById);

// POST /api/received-consignment-settlements - Crear liquidación
router.post('/', auth, express.json(), createReceivedConsignmentSettlement);

// PUT /api/received-consignment-settlements/:id - Actualizar liquidación
router.put('/:id', auth, express.json(), updateReceivedConsignmentSettlement);

// DELETE /api/received-consignment-settlements/:id - Eliminar liquidación
router.delete('/:id', auth, deleteReceivedConsignmentSettlement);

export default router;
