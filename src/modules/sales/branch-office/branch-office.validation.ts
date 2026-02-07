import { z } from 'zod';

/**
 * Schema para crear una sucursal
 * Los campos societyId, createdBy se inyectan automáticamente desde la sesión
 */
export const createBranchOfficeSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    code: z.string().min(1, 'El código es requerido'),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    isMain: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

/**
 * Schema para actualizar una sucursal
 */
export const updateBranchOfficeSchema = z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    isMain: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

/**
 * Schema para el parámetro ID
 */
export const branchOfficeIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
