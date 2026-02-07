import { z } from 'zod';

/**
 * Schema para crear un pago de orden
 * Los campos societyId, createdBy se inyectan automáticamente desde la sesión
 */
export const createOrderPaymentSchema = z.object({
    orderId: z.string().uuid('ID de orden inválido'),
    paymentMethodId: z.string().uuid('ID de método de pago inválido').optional(), // Opcional si es efectivo por defecto, depende de reglas
    paymentMethod: z.string().optional(), // Alternativa si se envía código en vez de ID
    amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
    paymentDate: z.string().datetime().optional(),
    referenceCode: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
});

/**
 * Schema para actualizar un pago de orden
 */
export const updateOrderPaymentSchema = z.object({
    orderId: z.string().uuid().optional(),
    paymentMethodId: z.string().uuid().optional(),
    paymentMethod: z.string().optional(),
    amount: z.number().min(0.01).optional(),
    paymentDate: z.string().datetime().optional(),
    referenceCode: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
});

/**
 * Schema para el parámetro ID
 */
export const orderPaymentIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
