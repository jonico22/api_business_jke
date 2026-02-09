import { z } from 'zod';

const orderItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(0.01),
    unitPrice: z.number().min(0),
    discount: z.number().min(0).default(0),
    tax: z.number().min(0).default(0),
    total: z.number().min(0),
});

/**
 * Schema para crear una orden
 * Los campos societyId, createdBy se inyectan automáticamente desde la sesión
 */
export const createOrderSchema = z.object({
    date: z.string().datetime().optional(), // Fecha de la orden
    deliveryDate: z.string().datetime().optional(), // Fecha de entrega
    partnerId: z.string().uuid('ID de cliente inválido'),
    branchOfficeId: z.string().uuid('ID de sucursal inválido').optional(), // Sucursal de venta
    societyId: z.string().uuid('ID de sociedad inválido'),
    branchId: z.string().uuid('ID de sucursal inválido'),
    currencyId: z.string(),
    orderItems: z.array(orderItemSchema).min(1, 'Debe incluir al menos un ítem'),
    subtotal: z.number().min(0),
    taxAmount: z.number().min(0),
    comment: z.string().optional(),
    discount: z.number().min(0).default(0),
    notes: z.string().optional(),
    status: z.string().optional(), // PENDING, APPROVED, etc.
});

/**
 * Schema para actualizar una orden
 */
export const updateOrderSchema = z.object({
    date: z.string().datetime().optional(),
    deliveryDate: z.string().datetime().optional(),
    customerId: z.string().uuid().optional(),
    branchOfficeId: z.string().uuid().optional(),
    currencyId: z.string().uuid().optional(),
    items: z.array(orderItemSchema).optional(),
    subtotal: z.number().optional(),
    taxAmount: z.number().optional(),
    total: z.number().optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
    cancellationReason: z.string().optional(),
    comment: z.string().optional(),
});

/**
 * Schema para el parámetro ID
 */
export const orderIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
