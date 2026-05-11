import { z } from 'zod';

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD');

const nonNegativeNumberSchema = z.coerce.number({
    invalid_type_error: 'Debe ser un número válido'
}).min(0, 'El valor no puede ser negativo');

export const createExternalConsignmentSaleSchema = z.object({
    deliveredConsignmentId: z.string().uuid('Entrega de consignación inválida'),
    soldQuantity: nonNegativeNumberSchema,
    reportedSaleDate: dateStringSchema,
    reportedSalePrice: nonNegativeNumberSchema,
    unitSalePrice: nonNegativeNumberSchema,
    totalCommissionAmount: nonNegativeNumberSchema,
    netTotal: nonNegativeNumberSchema.optional(),
    remarks: z.string().optional(),
    documentReference: z.string().optional(),
});

export const updateExternalConsignmentSaleSchema = z.object({
    deliveredConsignmentId: z.string().uuid('Entrega de consignación inválida').optional(),
    soldQuantity: nonNegativeNumberSchema.optional(),
    reportedSaleDate: dateStringSchema.optional(),
    reportedSalePrice: nonNegativeNumberSchema.optional(),
    unitSalePrice: nonNegativeNumberSchema.optional(),
    totalCommissionAmount: nonNegativeNumberSchema.optional(),
    netTotal: nonNegativeNumberSchema.optional(),
    remarks: z.string().optional(),
    documentReference: z.string().optional(),
});

export const externalConsignmentSaleIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

export const listExternalConsignmentSalesSchema = z.object({
    deliveredConsignmentId: z.string().uuid('Entrega de consignación inválida').optional(),
    reportedSaleDateFrom: dateStringSchema.optional(),
    reportedSaleDateTo: dateStringSchema.optional(),
    minSalePrice: nonNegativeNumberSchema.optional(),
    maxSalePrice: nonNegativeNumberSchema.optional(),
    page: z.coerce.number().int().min(1, 'La página debe ser mayor o igual a 1').optional(),
    limit: z.coerce.number().int().min(1, 'El límite debe ser mayor o igual a 1').max(100, 'El límite no puede ser mayor a 100').optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
}).refine((data) => {
    if (!data.reportedSaleDateFrom || !data.reportedSaleDateTo) {
        return true;
    }

    return data.reportedSaleDateTo >= data.reportedSaleDateFrom;
}, {
    message: 'La fecha final no puede ser menor a la fecha inicial',
    path: ['reportedSaleDateTo']
}).refine((data) => {
    if (data.minSalePrice === undefined || data.maxSalePrice === undefined) {
        return true;
    }

    return data.maxSalePrice >= data.minSalePrice;
}, {
    message: 'El precio máximo no puede ser menor al precio mínimo',
    path: ['maxSalePrice']
});
