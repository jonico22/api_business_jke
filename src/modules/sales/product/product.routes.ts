import { Router } from 'express';
import {
    getAllProducts,
    getProductsForSelect,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getUpdatedByUsers,
    getCreatedByUsers
} from './product.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Productos
 * Todas las rutas requieren autenticación
 */

// GET /api/sales/products - Obtener todos los productos
router.get('/', auth, getAllProducts);

// GET /api/sales/products/select - Obtener productos para select/dropdown
router.get('/select', auth, getProductsForSelect);

// GET /api/sales/products/created-by-users - Obtener usuarios que han creado productos
router.get('/created-by-users', auth, getCreatedByUsers);

// GET /api/sales/products/updated-by-users - Obtener usuarios que han actualizado productos
router.get('/updated-by-users', auth, getUpdatedByUsers);

// GET /api/sales/products/:id - Obtener un producto por ID
router.get('/:id', auth, getProductById);

// POST /api/sales/products - Crear un nuevo producto
router.post('/', auth, createProduct);

// PUT /api/sales/products/:id - Actualizar un producto
router.put('/:id', auth, updateProduct);

// DELETE /api/sales/products/:id - Eliminar un producto
router.delete('/:id', auth, deleteProduct);

export default router;
