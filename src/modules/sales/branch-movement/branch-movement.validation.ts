import { z } from 'zod';

/**
 * Schema para listar movimientos (Paginado)
 * GET /api/branch-movements
 */
export const listBranchMovementsSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    fromBranchId: z.string().uuid().optional(),
    toBranchId: z.string().uuid().optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
});

/**
 * Schema para crear un traslado (Paso 1: Reserva)
 * POST /api/branch-movements
 */
export const createBranchMovementSchema = z.object({
    originBranchId: z.string().uuid(),
    destinationBranchId: z.string().uuid(),
    productId: z.string().uuid(),
    quantityMoved: z.number().int().positive(),
    movementDate: z.coerce.date().optional(),
    notes: z.string().optional(),
    referenceCode: z.string().optional(),
});

/**
 * Schema para confirmar o cancelar un traslado
 * PUT /api/branch-movements/:id
 */
export const updateBranchMovementStatusSchema = z.object({
    status: z.enum(['COMPLETED', 'CANCELLED'], {
        errorMap: () => ({ message: 'El estado debe ser COMPLETED o CANCELLED' })
    }),
    cancellationReason: z.string().optional(),
}).refine(data => {
    if (data.status === 'CANCELLED' && !data.cancellationReason) {
        return false;
    }
    return true;
}, {
    message: 'El motivo de cancelación es requerido cuando el estado es CANCELLED',
    path: ['cancellationReason']
});

/**
 * Schema para el parámetro ID
 */
export const branchMovementIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

/**
 * Schema para traslados en bloque (Bulk Transfer)
 * POST /api/branch-movements/bulk
 */
export const bulkTransferSchema = z.object({
    originBranchId: z.string().uuid('ID de sucursal de origen inválido'),
    destinationBranchId: z.string().uuid('ID de sucursal de destino inválido'),
    items: z.array(z.object({
        productId: z.string().uuid('ID de producto inválido'),
        quantityMoved: z.number().positive('La cantidad debe ser mayor a 0'),
        notes: z.string().optional(),
    })).min(1, 'Debe incluir al menos un producto'),
    referenceCode: z.string().min(1, 'El código de referencia es requerido'),
});

/**
 * Schema para traslado total de almacén (Transfer All)
 * POST /api/branch-movements/transfer-all
 */
export const transferAllSchema = z.object({
    originBranchId: z.string().uuid('ID de sucursal de origen inválido'),
    destinationBranchId: z.string().uuid('ID de sucursal de destino inválido'),
    notes: z.string().optional(),
    referenceCode: z.string().min(1, 'El código de referencia es requerido'),
    createdBy: z.string().uuid('ID de usuario creador inválido').optional(),
});
