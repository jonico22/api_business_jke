import { z } from 'zod';

/**
 * Schema para crear una sociedad
 * Los campos societyId, createdBy se inyectan automáticamente desde la sesión
 */
export const createSocietySchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    code: z.string().min(1, 'El código es requerido'),
    address: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    web: z.string().url('URL inválida').optional().or(z.literal('')),
    isActive: z.boolean().default(true),
});

/**
 * Schema para actualizar una sociedad
 */
export const updateSocietySchema = z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    address: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    web: z.string().url('URL inválida').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
});

/**
 * Schema para el parámetro ID
 */
export const societyIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
