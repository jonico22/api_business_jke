import { Router } from 'express';
import {
    getAllProducts,
    getProductsForSelect,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getUpdatedByUsers,
    getCreatedByUsers,
    bulkUploadProducts
} from './product.controller';
import auth from '@/middlewares/auth.middleware';
import { upload } from '@/middlewares/upload.middleware';
import { validateCSVFile } from '@/middlewares/csv-upload.middleware';

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

// POST /api/sales/products/bulk-upload - Carga masiva de productos desde CSV
router.post('/bulk-upload', auth, upload.single('file'), validateCSVFile, bulkUploadProducts);

import express from 'express';

// ... imports

// POST /api/sales/products - Crear un nuevo producto
router.post('/', auth, express.json(), createProduct);

// PUT /api/sales/products/:id - Actualizar un producto
router.put('/:id', auth, express.json(), updateProduct);

// DELETE /api/sales/products/:id - Eliminar un producto
router.delete('/:id', auth, deleteProduct);

export default router;
