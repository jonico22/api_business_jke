import { z } from 'zod';

export enum PartnerType {
    CUSTOMER = 'CUSTOMER',
    SUPPLIER = 'SUPPLIER',
    BOTH = 'BOTH'
}

export const PartnerTypeEnum = z.nativeEnum(PartnerType);

export enum BussinessPartnerPersonType {
    PERSON = 'PERSON',
    LEGAL_ENTITY = 'LEGAL_ENTITY'
}

export const BussinessPartnerPersonTypeEnum = z.nativeEnum(BussinessPartnerPersonType);

/**
 * Schema para crear un cliente (Business Partner type=CUSTOMER)
 * Los campos societyId, createdBy se inyectan automáticamente desde la sesión
 */
export const createClientSchema = z.object({
    // Campos comunes para socio de negocio
    typeBP: BussinessPartnerPersonTypeEnum.default(BussinessPartnerPersonType.PERSON),
    typeDocId: z.string().uuid().optional(),
    documentNumber: z.string().optional(),
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    surname: z.string().optional(),
    sex: z.string().optional(),
    companyName: z.string().optional(),
    contactEmail: z.string().email().optional(),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().optional(),
    telephone: z.string().optional(),
    address: z.string().optional(),
    isActive: z.boolean().default(true),
    societyId: z.string().uuid('Society ID inválido'),
    type: PartnerTypeEnum.default(PartnerType.CUSTOMER),
});

/**
 * Schema para actualizar un cliente
 */
export const updateClientSchema = z.object({
    typeBP: BussinessPartnerPersonTypeEnum.optional(),
    typeDocId: z.string().uuid().optional(),
    documentNumber: z.string().optional(),
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    surname: z.string().optional(),
    sex: z.string().optional(),
    companyName: z.string().optional(),
    contactEmail: z.string().email().optional(),
    email: z.string().email('Email inválido').optional(),
    societyId: z.string().uuid('Society ID inválido').optional(),
    type: PartnerTypeEnum.default(PartnerType.CUSTOMER).optional(),
    phone: z.string().optional(),
    telephone: z.string().optional(),
    address: z.string().optional(),
    isActive: z.boolean().optional(),
});

/**
 * Schema para el parámetro ID
 */
export const clientIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});
