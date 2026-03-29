import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
    requestApiSaleGet,
    requestApiSalePost
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import {
    openCashShiftSchema,
    closeCashShiftSchema,
    cashShiftIdSchema,
    createManualMovementSchema,
    currentCashShiftQuerySchema
} from './cash-shift.validation';

/**
 * Abrir un nuevo turno de caja
 * POST /api/cash-shifts/open
 */
export const openCashShift = async (req: Request, res: Response) => {
    try {
        const validation = openCashShiftSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const cashShiftData = {
            ...validation.data,
            userId: req.user?.id,
        };

        const result = await requestApiSalePost('cash-shifts/open', cashShiftData);
        return successResponse(res, result, 'Turno de caja abierto exitosamente', 201);
    } catch (error: any) {
        // Manejar el error 409 específicamente si viene de la API de ventas
        if (error.message.includes('409')) {
            return errorResponse(res, 'Ya existe una caja abierta para este usuario/sucursal', 409);
        }
        return errorResponse(res, 'Error al abrir turno de caja', 500, error.message);
    }
};

/**
 * Obtener todos los turnos de caja
 * GET /api/cash-shifts
 */
export const getAllCashShifts = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const cashShifts = await requestApiSaleGet(`cash-shifts?${queryParams}`);
        return successResponse(res, cashShifts, 'Turnos de caja obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener turnos de caja', 500, error.message);
    }
};

/**
 * Obtener turnos de caja para select/dropdown
 * GET /api/cash-shifts/select
 */
export const getCashShiftsForSelect = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const cashShifts = await requestApiSaleGet(`cash-shifts/select?societyCode=${societyId}`);
        return successResponse(res, cashShifts, 'Turnos de caja para select obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener turnos de caja para select', 500, error.message);
    }
};

/**
 * Cerrar un turno de caja
 * POST /api/cash-shifts/close/:id
 */
export const closeCashShift = async (req: Request, res: Response) => {
    try {
        const paramValidation = cashShiftIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = closeCashShiftSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const { id } = paramValidation.data;
        const closeData = {
            ...bodyValidation.data,
            userId: req.user?.id,
        };
        console.log(closeData);

        const result = await requestApiSalePost(`cash-shifts/close/${id}`, closeData);
        return successResponse(res, result, 'Turno de caja cerrado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al cerrar turno de caja', 500, error.message);
    }
};

/**
 * Obtener detalle de un turno de caja
 * GET /api/cash-shifts/:id
 */
export const getCashShiftById = async (req: Request, res: Response) => {
    try {
        const validation = cashShiftIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const cashShift = await requestApiSaleGet(`cash-shifts/${id}`);
        return successResponse(res, cashShift, 'Detalle de turno de caja obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener detalle de turno de caja', 500, error.message);
    }
};

/**
 * Agregar movimiento manual (Ingreso/Egreso)
 * POST /api/cash-shifts/movements
 */
export const createManualMovement = async (req: Request, res: Response) => {
    try {
        const validation = createManualMovementSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const movementData = {
            ...validation.data,
            userId: req.user?.id,
        };

        const result = await requestApiSalePost('cash-shifts/movements', movementData);
        return successResponse(res, result, 'Movimiento manual registrado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al registrar movimiento manual', 500, error.message);
    }
};

/**
 * Obtener usuarios que han abierto cajas
 * GET /api/cash-shifts/created-by
 */
export const getCreatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        // 1. Obtener datos de la API de ventas
        const userIdsRaw = await requestApiSaleGet(`cash-shifts/created-by?societyCode=${societyId}`);

        // 2. Extraer IDs de usuarios únicos
        const userIds = [...new Set(userIdsRaw)];

        // 3. Consultar nombres de usuarios en Prisma
        if (userIds.length > 0) {
            const users = await prisma.user.findMany({
                where: {
                    id: { in: userIds as string[] }
                },
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            });

            return successResponse(res, users, 'Usuarios de cajas obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios de cajas');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios de cajas', 500, error.message);
    }
};

/**
 * Consultar Estado de Caja Actual
 * GET /api/cash-shifts/current
 */
export const getCurrentCashShift = async (req: Request, res: Response) => {
    try {
        const validation = currentCashShiftQuerySchema.safeParse(req.query);
        if (!validation.success) {
            return errorResponse(res, 'Parámetros de consulta inválidos', 400, validation.error.format());
        }

        const queryParams = new URLSearchParams({
            branchId: validation.data.branchId,
            userId: req.user?.id || '',
            societyCode: req.societyId?.toString() || '1',
        }).toString();

        const result = await requestApiSaleGet(`cash-shifts/current?${queryParams}`);
        return successResponse(res, result, 'Estado de caja actual obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener estado de caja actual', 500, error.message);
    }
};
