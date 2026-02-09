import { Router } from 'express';
import {
    getAllBranchOffices,
    getBranchOfficesForSelect,
    getBranchOfficeById,
    createBranchOffice,
    updateBranchOffice,
    deleteBranchOffice,
    getUpdatedByUsers,
    getCreatedByUsers
} from './branch-office.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Sucursales
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/branch-offices - Obtener todas las sucursales
router.get('/', auth, getAllBranchOffices);

// GET /api/sales/branch-offices/select - Obtener sucursales para select/dropdown
router.get('/select', auth, getBranchOfficesForSelect);

// GET /api/sales/branch-offices/created-by-users - Obtener usuarios que han creado sucursales
router.get('/created-by-users', auth, getCreatedByUsers);

// GET /api/sales/branch-offices/updated-by-users - Obtener usuarios que han actualizado sucursales
router.get('/updated-by-users', auth, getUpdatedByUsers);

// GET /api/sales/branch-offices/:id - Obtener una sucursal por ID
router.get('/:id', auth, getBranchOfficeById);

// POST /api/sales/branch-offices - Crear una nueva sucursal
router.post('/', auth, createBranchOffice);

// PUT /api/sales/branch-offices/:id - Actualizar una sucursal
router.put('/:id', auth, updateBranchOffice);

// DELETE /api/sales/branch-offices/:id - Eliminar una sucursal
router.delete('/:id', auth, deleteBranchOffice);

export default router;
