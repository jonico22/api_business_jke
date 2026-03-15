import { Router } from 'express';
import { 
    getInventory, 
    getInventoryById, 
    getInventoryForSelect, 
    updateInventory 
} from './branch-office-products.controller';
import auth from '@/middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para el módulo de Inventario por Sucursal
 * Todas las rutas requieren autenticación
 */

// GET /api/branch-office-products - Listar inventario (Paginado)
router.get('/', auth, getInventory);

// GET /api/branch-office-products/select - Selector de inventario
router.get('/select', auth, getInventoryForSelect);

// GET /api/branch-office-products/:id - Detalle de inventario
router.get('/:id', auth, getInventoryById);

// PUT /api/branch-office-products/:id - Actualizar inventario
router.put('/:id', auth, updateInventory);

export default router;
