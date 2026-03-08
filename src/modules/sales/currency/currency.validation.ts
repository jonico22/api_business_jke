import { z } from 'zod';

/**
 * Schema para crear una moneda
 * Los campos societyId, createdBy se inyectan automáticamente desde la sesión
 */
export const createCurrencySchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    code: z.string().min(1, 'El código es requerido'),
    symbol: z.string().min(1, 'El símbolo es requerido'),
    exchangeRate: z.number().default(1),
    isMain: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

/**
 * Schema para actualizar una moneda
 */
export const updateCurrencySchema = z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    symbol: z.string().min(1).optional(),
    exchangeRate: z.number().optional(),
    isMain: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

/**
 * Schema para el parámetro ID
 */
export const currencyIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
