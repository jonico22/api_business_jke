import { Router } from 'express';
import {
    getAllSocieties,
    getSocietiesForSelect,
    getSocietyById,
    createSociety,
    updateSociety,
    deleteSociety,
    getUpdatedByUsers,
    getCreatedByUsers
} from './society.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Sociedades
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/societies - Obtener todas las sociedades
router.get('/', auth, getAllSocieties);

// GET /api/sales/societies/select - Obtener sociedades para select/dropdown
router.get('/select', auth, getSocietiesForSelect);

// GET /api/sales/societies/created-by-users - Obtener usuarios que han creado sociedades
router.get('/created-by-users', auth, getCreatedByUsers);

// GET /api/sales/societies/updated-by-users - Obtener usuarios que han actualizado sociedades
router.get('/updated-by-users', auth, getUpdatedByUsers);

// GET /api/sales/societies/:id - Obtener una sociedad por ID
router.get('/:id', auth, getSocietyById);

// POST /api/sales/societies - Crear una nueva sociedad
router.post('/', auth, createSociety);

// PUT /api/sales/societies/:id - Actualizar una sociedad
router.put('/:id', auth, updateSociety);

// DELETE /api/sales/societies/:id - Eliminar una sociedad
router.delete('/:id', auth, deleteSociety);

export default router;
