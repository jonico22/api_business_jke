import { z } from 'zod';

export enum ReceivedConsignmentSettlementStatus {
    PENDING = 'PENDING',
    PAID = 'PAID'
}

const uuidOrCodeSchema = z.string().min(1, 'El valor es requerido');

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD');

const nonNegativeNumberSchema = z.coerce.number({
    invalid_type_error: 'Debe ser un número válido'
}).min(0, 'El valor no puede ser negativo');

export const receivedConsignmentSettlementStatusSchema = z.nativeEnum(ReceivedConsignmentSettlementStatus);

export const createReceivedConsignmentSettlementSchema = z.object({
    outgoingAgreementId: z.string().uuid('Acuerdo de consignación inválido'),
    orderPaymentId: z.string().uuid('Pago de orden inválido').optional(),
    settlementDate: dateStringSchema,
    totalReportedSalesAmount: nonNegativeNumberSchema,
    consigneeCommissionAmount: nonNegativeNumberSchema,
    totalReceivedAmount: nonNegativeNumberSchema,
    status: receivedConsignmentSettlementStatusSchema,
    receiptReference: z.string().optional(),
    settlementNotes: z.string().optional(),
    currencyId: z.string().uuid('Moneda inválida'),
    createdBy: z.string().optional(),
}).refine((data) => {
    const expectedTotal = data.totalReportedSalesAmount - data.consigneeCommissionAmount;
    return data.totalReceivedAmount === expectedTotal;
}, {
    message: 'El total recibido debe ser igual a totalReportedSalesAmount - consigneeCommissionAmount',
    path: ['totalReceivedAmount']
});

export const updateReceivedConsignmentSettlementSchema = z.object({
    outgoingAgreementId: z.string().uuid('Acuerdo de consignación inválido').optional(),
    orderPaymentId: z.string().uuid('Pago de orden inválido').optional(),
    settlementDate: dateStringSchema.optional(),
    totalReportedSalesAmount: nonNegativeNumberSchema.optional(),
    consigneeCommissionAmount: nonNegativeNumberSchema.optional(),
    totalReceivedAmount: nonNegativeNumberSchema.optional(),
    status: receivedConsignmentSettlementStatusSchema.optional(),
    receiptReference: z.string().optional(),
    settlementNotes: z.string().optional(),
    currencyId: z.string().uuid('Moneda inválida').optional(),
    updatedBy: z.string().optional(),
}).refine((data) => {
    if (
        data.totalReportedSalesAmount === undefined ||
        data.consigneeCommissionAmount === undefined ||
        data.totalReceivedAmount === undefined
    ) {
        return true;
    }

    const expectedTotal = data.totalReportedSalesAmount - data.consigneeCommissionAmount;
    return data.totalReceivedAmount === expectedTotal;
}, {
    message: 'El total recibido debe ser igual a totalReportedSalesAmount - consigneeCommissionAmount',
    path: ['totalReceivedAmount']
});

export const receivedConsignmentSettlementIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

export const listReceivedConsignmentSettlementsSchema = z.object({
    societyId: uuidOrCodeSchema.optional(),
    societyCode: z.string().min(1, 'Código de sociedad inválido').optional(),
    outgoingAgreementId: z.string().uuid('Acuerdo de consignación inválido').optional(),
    status: receivedConsignmentSettlementStatusSchema.optional(),
    settlementDateFrom: dateStringSchema.optional(),
    settlementDateTo: dateStringSchema.optional(),
    page: z.coerce.number().int().min(1, 'La página debe ser mayor o igual a 1').optional(),
    limit: z.coerce.number().int().min(1, 'El límite debe ser mayor o igual a 1').max(100, 'El límite no puede ser mayor a 100').optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
}).refine((data) => {
    if (!data.settlementDateFrom || !data.settlementDateTo) {
        return true;
    }

    return data.settlementDateTo >= data.settlementDateFrom;
}, {
    message: 'La fecha final no puede ser menor a la fecha inicial',
    path: ['settlementDateTo']
});
