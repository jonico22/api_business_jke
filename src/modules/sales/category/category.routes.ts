

import { Router } from 'express';
import {
    getAllCategories,
    getCategoriesForSelect,
    getUpdatedByUsers,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCreatedByUsers,
    bulkUploadCategories
} from './category.controller';
import auth from '@/middlewares/auth.middleware';
import { upload } from '@/middlewares/upload.middleware';
import { validateCSVFile } from '@/middlewares/csv-upload.middleware';

const router = Router();

/**
 * Rutas para el módulo de Categorías
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/categories - Obtener todas las categorías
router.get('/', auth, getAllCategories);

// GET /api/sales/categories/select - Obtener categorías para select/dropdown
router.get('/select', auth, getCategoriesForSelect);

// GET /api/sales/categories/created-by-users - Obtener usuarios que han creado categorías
router.get('/created-by-users', auth, getCreatedByUsers);

// GET /api/sales/categories/updated-by-users - Obtener usuarios que han actualizado categoríasuarios
router.get('/updated-by-users', auth, getUpdatedByUsers);

// POST /api/sales/categories/bulk-upload - Carga masiva de categorías desde CSV
router.post('/bulk-upload', auth, upload.single('file'), validateCSVFile, bulkUploadCategories);

// GET /api/sales/categories/:id - Obtener una categoría por ID
router.get('/:id', auth, getCategoryById);

import express from 'express';

// ... imports

// POST /api/categories - Crear una nueva categoría
router.post('/', auth, express.json(), createCategory);

// PUT /api/categories/:id - Actualizar una categoría
router.put('/:id', auth, express.json(), updateCategory);

// DELETE /api/categories/:id - Eliminar una categoría
router.delete('/:id', auth, deleteCategory);

export default router;
