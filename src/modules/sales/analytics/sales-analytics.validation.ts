import { z } from 'zod';

const uuidOrCodeSchema = z.string().min(1, 'El valor es requerido');

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD');

const comparePreviousSchema = z.preprocess((value) => {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') {
            return true;
        }

        if (value.toLowerCase() === 'false') {
            return false;
        }
    }

    return value;
}, z.boolean({
    invalid_type_error: 'comparePrevious debe ser true o false'
}).optional());

export const analyticsQuerySchema = z.object({
    societyId: uuidOrCodeSchema.optional(),
    societyCode: z.string().min(1, 'Código de sociedad inválido').optional(),
    branchId: z.string().uuid('Sucursal inválida').optional(),
    dateFrom: dateStringSchema.optional(),
    dateTo: dateStringSchema.optional(),
    granularity: z.enum(['day', 'week', 'month']).optional(),
    comparePrevious: comparePreviousSchema,
    limit: z.coerce.number().int().min(1, 'El límite debe ser mayor o igual a 1').max(100, 'El límite no puede ser mayor a 100').optional(),
}).refine((data) => {
    if (!data.dateFrom || !data.dateTo) {
        return true;
    }

    return data.dateTo >= data.dateFrom;
}, {
    message: 'La fecha final no puede ser menor a la fecha inicial',
    path: ['dateTo']
});

