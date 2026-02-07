import { z } from 'zod';

/**
 * Schema para crear un cliente (Business Partner type=CUSTOMER)
 * Los campos societyId, createdBy se inyectan automáticamente desde la sesión
 */
export const createClientSchema = z.object({
    // Campos comunes para socio de negocio
    typeBP: z.string().optional(), // Puede ser PERSON o COMPANY
    typeDocId: z.string().optional(),
    documentNumber: z.string().min(1, 'El número de documento es requerido'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    isActive: z.boolean().default(true),
});

/**
 * Schema para actualizar un cliente
 */
export const updateClientSchema = z.object({
    typeBP: z.string().optional(),
    typeDocId: z.string().optional(),
    documentNumber: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    isActive: z.boolean().optional(),
});

/**
 * Schema para el parámetro ID
 */
export const clientIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
