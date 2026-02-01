import { z } from 'zod';

/**
 * Schema para crear una categoría
 * Los campos societyId y createdBy se inyectan automáticamente desde la sesión
 */
export const createCategorySchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    code: z.string().min(1, 'El código es requerido'),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});

/**
 * Schema para actualizar una categoría
 * El campo updatedBy se inyecta automáticamente desde la sesión
 */
export const updateCategorySchema = z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});

/**
 * Schema para el parámetro ID
 */
export const categoryIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
