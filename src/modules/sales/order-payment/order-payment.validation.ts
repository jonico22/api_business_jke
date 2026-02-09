import { z } from 'zod';
import { PaymentMethodOrder, PaymentStatus } from './order-payment.enums';

/**
 * Schema para crear un pago de orden
 */
export const createOrderPaymentSchema = z.object({
    orderId: z.string().uuid('ID de orden inválido').optional(), // user requested optional
    societyId: z.string().uuid('ID de sociedad inválido'),

    // Financials
    amount: z.number().positive('El monto debe ser positivo'),
    currencyId: z.string(), // using uuid validation as safe default
    exchangeRate: z.number().positive().default(1.0),

    paymentDate: z.string().datetime().optional(),
    paymentMethod: z.nativeEnum(PaymentMethodOrder),

    // Status & Evidence
    status: z.nativeEnum(PaymentStatus).optional(),
    imageId: z.string().uuid('ID de imagen inválido').optional(),
    referenceCode: z.string().optional(),
    notes: z.string().optional(),
});

/**
 * Schema para actualizar un pago de orden
 */
export const updateOrderPaymentSchema = z.object({
    orderId: z.string().uuid().optional(),
    societyId: z.string().uuid().optional(),
    amount: z.number().positive().optional(),
    currencyId: z.string().uuid().optional(),
    exchangeRate: z.number().positive().optional(),
    paymentDate: z.string().datetime().optional(),
    paymentMethod: z.nativeEnum(PaymentMethodOrder).optional(),
    status: z.nativeEnum(PaymentStatus).optional(),
    imageId: z.string().uuid().optional(),
    referenceCode: z.string().optional(),
    notes: z.string().optional(),
});

/**
 * Schema para el parámetro ID
 */
export const orderPaymentIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
