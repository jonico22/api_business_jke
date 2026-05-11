import { z } from 'zod';

const uuidOrCodeSchema = z.string().min(1, 'El valor es requerido');

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD');

const nonNegativeNumberSchema = z.coerce.number({
    invalid_type_error: 'Debe ser un número válido'
}).min(0, 'El valor no puede ser negativo');

export const createDeliveredConsignmentAgreementSchema = z.object({
    consignmentAgreementId: z.string().uuid('Acuerdo de consignación inválido'),
    productId: z.string().uuid('Producto inválido'),
    branchId: z.string().uuid('Sucursal inválida'),
    deliveredStock: nonNegativeNumberSchema,
    remainingStock: nonNegativeNumberSchema.optional(),
    costPrice: nonNegativeNumberSchema,
    suggestedSalePrice: nonNegativeNumberSchema,
    taxAmount: nonNegativeNumberSchema.optional(),
    totalCost: nonNegativeNumberSchema.optional(),
    totalValue: nonNegativeNumberSchema.optional(),
    deliveryDate: dateStringSchema,
    status: z.string().min(1, 'El estado es requerido'),
    notes: z.string().optional(),
}).refine((data) => {
    if (data.remainingStock === undefined) {
        return true;
    }

    return data.remainingStock <= data.deliveredStock;
}, {
    message: 'El stock restante no puede ser mayor al stock entregado',
    path: ['remainingStock']
});

export const updateDeliveredConsignmentAgreementSchema = z.object({
    consignmentAgreementId: z.string().uuid('Acuerdo de consignación inválido').optional(),
    productId: z.string().uuid('Producto inválido').optional(),
    branchId: z.string().uuid('Sucursal inválida').optional(),
    deliveredStock: nonNegativeNumberSchema.optional(),
    remainingStock: nonNegativeNumberSchema.optional(),
    costPrice: nonNegativeNumberSchema.optional(),
    suggestedSalePrice: nonNegativeNumberSchema.optional(),
    taxAmount: nonNegativeNumberSchema.optional(),
    totalCost: nonNegativeNumberSchema.optional(),
    totalValue: nonNegativeNumberSchema.optional(),
    deliveryDate: dateStringSchema.optional(),
    status: z.string().min(1, 'El estado es requerido').optional(),
    notes: z.string().optional(),
}).refine((data) => {
    if (data.remainingStock === undefined || data.deliveredStock === undefined) {
        return true;
    }

    return data.remainingStock <= data.deliveredStock;
}, {
    message: 'El stock restante no puede ser mayor al stock entregado',
    path: ['remainingStock']
});

export const deliveredConsignmentAgreementIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

export const listDeliveredConsignmentAgreementsSchema = z.object({
    societyId: uuidOrCodeSchema.optional(),
    societyCode: z.string().min(1, 'Código de sociedad inválido').optional(),
    consignmentAgreementId: z.string().uuid('Acuerdo de consignación inválido').optional(),
    productId: z.string().uuid('Producto inválido').optional(),
    branchId: z.string().uuid('Sucursal inválida').optional(),
    status: z.string().min(1, 'Estado inválido').optional(),
    deliveryDateFrom: dateStringSchema.optional(),
    deliveryDateTo: dateStringSchema.optional(),
    page: z.coerce.number().int().min(1, 'La página debe ser mayor o igual a 1').optional(),
    limit: z.coerce.number().int().min(1, 'El límite debe ser mayor o igual a 1').max(100, 'El límite no puede ser mayor a 100').optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
}).refine((data) => {
    if (!data.deliveryDateFrom || !data.deliveryDateTo) {
        return true;
    }

    return data.deliveryDateTo >= data.deliveryDateFrom;
}, {
    message: 'La fecha final no puede ser menor a la fecha inicial',
    path: ['deliveryDateTo']
});
