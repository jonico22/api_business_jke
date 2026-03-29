import { z } from 'zod';

/**
 * Schema para consultar el Kardex / Historial de Movimientos
 * GET /api/inventory/kardex
 */
export const kardexQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  productId: z.string().uuid({ message: 'productId debe ser un UUID válido' }).optional(),
  branchId: z.string().uuid({ message: 'branchId debe ser un UUID válido' }).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum([
    'SALE_EXIT',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'ADJUSTMENT_ADD',
    'ADJUSTMENT_SUB',
    'PURCHASE_IN',
    'RETURN_IN',
    'RETURN_OUT',
    'INITIAL_STOCK'
  ]).optional(),
});

/**
 * Schema para ajuste manual de stock
 * POST /api/inventory/adjustment
 */
export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid({ message: 'productId debe ser un UUID válido' }),
  branchOfficeId: z.string().uuid({ message: 'branchOfficeId debe ser un UUID válido' }),
  type: z.enum(['ADJUSTMENT_ADD', 'ADJUSTMENT_SUB'], {
    errorMap: () => ({ message: 'El tipo debe ser ADJUSTMENT_ADD o ADJUSTMENT_SUB' })
  }),
  quantity: z.number().positive({ message: 'La cantidad debe ser mayor a 0' }),
  unitCost: z.number().nonnegative({ message: 'El costo unitario no puede ser negativo' }).optional(),
  notes: z.string().min(1, { message: 'Las notas son requeridas para un ajuste manual' }),
});
