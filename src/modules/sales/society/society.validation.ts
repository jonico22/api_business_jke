import { z } from 'zod';


enum Frequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    NEVER = 'NEVER'
}

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
    logoId: z.string().optional(),

    updatedBy: z.string().uuid().optional(),

    // Regional Config
    mainCurrencyId: z.string().uuid().optional(),
    taxIds: z.array(z.string().uuid()).optional(),

    // Customization
    stockNotificationFrequency: z.nativeEnum(Frequency).optional(),
    salesNotificationFrequency: z.nativeEnum(Frequency).optional(),
    backupFrequency: z.nativeEnum(Frequency).optional(),
    dataRetentionDays: z.number().int().min(1).optional(),
    uiConfig: z.record(z.string(), z.any()).optional()
});

/**
 * Schema para el parámetro ID
 */
export const societyIdSchema = z.object({
    id: z.string(),
});
