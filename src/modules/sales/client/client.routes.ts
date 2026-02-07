import { Router } from 'express';
import {
    getAllClients,
    getClientsForSelect,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    getUpdatedByUsers,
    getCreatedByUsers
} from './client.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Clientes
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/clients - Obtener todos los clientes
router.get('/', auth, getAllClients);

// GET /api/sales/clients/select - Obtener clientes para select/dropdown
router.get('/select', auth, getClientsForSelect);

// GET /api/sales/clients/created-by-users - Obtener usuarios que han creado clientes
router.get('/created-by-users', auth, getCreatedByUsers);

// GET /api/sales/clients/updated-by-users - Obtener usuarios que han actualizado clientes
router.get('/updated-by-users', auth, getUpdatedByUsers);

// GET /api/sales/clients/:id - Obtener un cliente por ID
router.get('/:id', auth, getClientById);

// POST /api/sales/clients - Crear un nuevo cliente
router.post('/', auth, createClient);

// PUT /api/sales/clients/:id - Actualizar un cliente
router.put('/:id', auth, updateClient);

// DELETE /api/sales/clients/:id - Eliminar un cliente
router.delete('/:id', auth, deleteClient);

export default router;
