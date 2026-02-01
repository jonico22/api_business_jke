import { Router } from 'express';
import {
    getAllCategories,
    getCategoriesForSelect,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from './category.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Categorías
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/categories - Obtener todas las categorías
router.get('/', auth, getAllCategories);

// GET /api/sales/categories/select - Obtener categorías para select/dropdown
router.get('/select', auth, getCategoriesForSelect);

// GET /api/sales/categories/:id - Obtener una categoría por ID
router.get('/:id', auth, getCategoryById);

// POST /api/categories - Crear una nueva categoría
router.post('/', auth, createCategory);

// PUT /api/categories/:id - Actualizar una categoría
router.put('/:id', auth, updateCategory);

// DELETE /api/categories/:id - Eliminar una categoría
router.delete('/:id', auth, deleteCategory);

export default router;
