import { z } from 'zod';

export enum OutgoingConsignmentAgreementStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    TERMINATED = 'TERMINATED',
    PENDING = 'PENDING'
}

const uuidOrCodeSchema = z.string().min(1, 'El valor es requerido');

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD');

const decimalNumberSchema = z.coerce.number({
    invalid_type_error: 'Debe ser un número válido'
});

export const outgoingConsignmentAgreementStatusSchema = z.nativeEnum(OutgoingConsignmentAgreementStatus);

export const createOutgoingConsignmentAgreementSchema = z.object({
    societyId: uuidOrCodeSchema,
    branchId: z.string().uuid('Sucursal inválida'),
    partnerId: z.string().uuid('Socio de negocio inválido'),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    commissionRate: decimalNumberSchema.min(0, 'La comisión no puede ser negativa'),
    currencyId: z.string().uuid('Moneda inválida'),
    totalValue: decimalNumberSchema.min(0, 'El valor total no puede ser negativo').optional(),
    creditLimit: decimalNumberSchema.min(0, 'El límite de crédito no puede ser negativo').optional(),
    agreementCode: z.string().min(1, 'El código del acuerdo es requerido'),
    status: outgoingConsignmentAgreementStatusSchema,
    notes: z.string().optional(),
    createdBy: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
    message: 'La fecha de fin no puede ser menor a la fecha de inicio',
    path: ['endDate']
});

export const updateOutgoingConsignmentAgreementSchema = z.object({
    societyId: uuidOrCodeSchema.optional(),
    branchId: z.string().uuid('Sucursal inválida').optional(),
    partnerId: z.string().uuid('Socio de negocio inválido').optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    commissionRate: decimalNumberSchema.min(0, 'La comisión no puede ser negativa').optional(),
    currencyId: z.string().uuid('Moneda inválida').optional(),
    totalValue: decimalNumberSchema.min(0, 'El valor total no puede ser negativo').optional(),
    creditLimit: decimalNumberSchema.min(0, 'El límite de crédito no puede ser negativo').optional(),
    agreementCode: z.string().min(1, 'El código del acuerdo es requerido').optional(),
    status: outgoingConsignmentAgreementStatusSchema.optional(),
    notes: z.string().optional(),
    updatedBy: z.string().optional(),
}).refine((data) => {
    if (!data.startDate || !data.endDate) {
        return true;
    }

    return data.endDate >= data.startDate;
}, {
    message: 'La fecha de fin no puede ser menor a la fecha de inicio',
    path: ['endDate']
});

export const outgoingConsignmentAgreementIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

export const listOutgoingConsignmentAgreementsSchema = z.object({
    societyId: uuidOrCodeSchema.optional(),
    societyCode: z.string().min(1, 'Código de sociedad inválido').optional(),
    branchId: z.string().uuid('Sucursal inválida').optional(),
    partnerId: z.string().uuid('Socio de negocio inválido').optional(),
    status: outgoingConsignmentAgreementStatusSchema.optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1, 'La página debe ser mayor o igual a 1').optional(),
    limit: z.coerce.number().int().min(1, 'El límite debe ser mayor o igual a 1').max(100, 'El límite no puede ser mayor a 100').optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
});
