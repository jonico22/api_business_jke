import { z } from 'zod';

/**
 * Schema para crear un producto
 * Los campos societyId, createdBy se inyectan automáticamente desde la sesión
 * Los campos id, createdAt, isDeleted son manejados por el sistema
 */
export const createProductSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    code: z.string().min(1, 'El código es requerido'),
    description: z.string().optional(),
    price: z.number({ required_error: 'El precio es requerido' }),
    priceCost: z.number({ required_error: 'El precio de costo es requerido' }),
    stock: z.number().int().default(0),
    minStock: z.number().int().default(0),
    categoryId: z.string({ required_error: 'La categoría es requerida' }),
    imageId: z.string().optional(),
    isActive: z.boolean().default(true),
});

/**
 * Schema para actualizar un producto
 * El campo updatedBy se inyecta automáticamente desde la sesión
 */
export const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    priceCost: z.number().optional(),
    stock: z.number().int().optional(),
    minStock: z.number().int().optional(),
    categoryId: z.string().optional(),
    imageId: z.string().optional(),
    isActive: z.boolean().optional(),
    code: z.string().min(1).optional(),
});

/**
 * Schema para el parámetro ID
 */
export const productIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
