import { z } from 'zod';

/**
 * Schema para listar inventario por sucursal (Paginado)
 * GET /api/branch-office-products
 */
export const listInventorySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  branchId: z.string().uuid({ message: 'branchId debe ser un UUID válido' }).optional(),
  categoryId: z.string().uuid({ message: 'categoryId debe ser un UUID válido' }).optional(),
});

/**
 * Schema para selector de inventario (Select - Paginado)
 * GET /api/branch-office-products/select
 */
export const selectInventorySchema = z.object({
  branchOfficeId: z.string().uuid({ message: 'branchOfficeId es requerido y debe ser un UUID válido' }),
  societyCode: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

/**
 * Schema para el ID de inventario
 */
export const inventoryIdSchema = z.object({
  id: z.string().uuid({ message: 'ID de inventario inválido' }),
});

/**
 * Schema para actualizar inventario
 * PUT /api/branch-office-products/:id
 */
export const updateInventorySchema = z.object({
  stockAvailable: z.number().nonnegative().optional(),
  stockPhysical: z.number().nonnegative().optional(),
  location: z.string().optional(),
});
