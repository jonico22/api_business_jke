import { z } from 'zod';

export const openCashShiftSchema = z.object({
  societyId: z.string().uuid({ message: 'societyId debe ser un UUID válido' }),
  branchId: z.string().uuid({ message: 'branchId debe ser un UUID válido' }),
  userId: z.string({ required_error: 'userId es requerido' }),
  initialAmount: z.number().min(0, { message: 'initialAmount debe ser mayor o igual a 0' }),
});

export const closeCashShiftSchema = z.object({
  finalReportedAmount: z.number().min(0, { message: 'finalReportedAmount debe ser mayor o igual a 0' }),
  reportedCashAmount: z.number().min(0, { message: 'reportedCashAmount debe ser mayor o igual a 0' }),
  reportedCardAmount: z.number().min(0, { message: 'reportedCardAmount debe ser mayor o igual a 0' }),
  reportedYapeAmount: z.number().min(0, { message: 'reportedYapeAmount debe ser mayor o igual a 0' }),
  reportedPlinAmount: z.number().min(0, { message: 'reportedPlinAmount debe ser mayor o igual a 0' }),
  reportedTransferAmount: z.number().min(0, { message: 'reportedTransferAmount debe ser mayor o igual a 0' }),
  userId: z.string({ required_error: 'userId es requerido' }),
  observations: z.string().optional(),
});

export const cashShiftIdSchema = z.object({
  id: z.string().uuid({ message: 'ID de turno de caja inválido' }),
});

export const currentCashShiftQuerySchema = z.object({
  branchId: z.string().uuid({ message: 'branchId debe ser un UUID válido' }),
});

export const createManualMovementSchema = z.object({
  shiftId: z.string().uuid({ message: 'shiftId debe ser un UUID válido' }),
  type: z.enum(['INCOME', 'EXPENSE'], { message: 'type debe ser INCOME o EXPENSE' }),
  amount: z.number().positive({ message: 'amount debe ser mayor a 0' }),
  description: z.string().min(1, { message: 'description es requerida' }),
  currencyId: z.string().uuid({ message: 'currencyId debe ser un UUID válido' }),
  paymentMethod: z.string({ required_error: 'paymentMethod es requerido' }),
  userId: z.string({ required_error: 'userId es requerido' }),
});
