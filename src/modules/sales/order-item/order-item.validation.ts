import { z } from 'zod';

/**
 * Schema para crear un item de orden
 * Los campos societyId, createdBy se inyectan automáticamente desde la sesión
 */
export const createOrderItemSchema = z.object({
    orderId: z.string().uuid('ID de orden inválido'),
    productId: z.string().uuid('ID de producto inválido'),
    quantity: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
    price: z.number().min(0, 'El precio no puede ser negativo'),
    discount: z.number().min(0).default(0),
    tax: z.number().min(0).default(0),
    total: z.number().min(0),
    notes: z.string().optional(),
});

/**
 * Schema para actualizar un item de orden
 */
export const updateOrderItemSchema = z.object({
    orderId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    quantity: z.number().min(0.01).optional(),
    price: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
    total: z.number().min(0).optional(),
    notes: z.string().optional(),
});

/**
 * Schema para el parámetro ID
 */
export const orderItemIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
