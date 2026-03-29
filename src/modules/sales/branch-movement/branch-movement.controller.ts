import { Request, Response } from 'express';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import {
    listBranchMovementsSchema,
    createBranchMovementSchema,
    updateBranchMovementStatusSchema,
    branchMovementIdSchema,
    bulkTransferSchema,
    transferAllSchema
} from './branch-movement.validation';

/**
 * Listar movimientos entre sucursales (Paginado)
 * GET /api/branch-movements
 */
export const getBranchMovements = async (req: Request, res: Response) => {
    try {
        const validation = listBranchMovementsSchema.safeParse(req.query);
        if (!validation.success) {
            return errorResponse(res, 'Parámetros de búsqueda inválidos', 400, validation.error.format());
        }

        const societyId = req.societyId || '1';
        
        const queryParams = new URLSearchParams({
            societyId: societyId.toString(),
            ...(validation.data as any)
        }).toString();

        const movements = await requestApiSaleGet(`branch-movements?${queryParams}`);
        return successResponse(res, movements, 'Movimientos obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener movimientos entre sucursales', 500, error.message);
    }
};

/**
 * Crear un nuevo traslado (Paso 1: Reserva)
 * POST /api/branch-movements
 */
export const createBranchMovement = async (req: Request, res: Response) => {
    try {
        const validation = createBranchMovementSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const movementData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
        };

        if (!movementData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }

        const movement = await requestApiSalePost('branch-movements', movementData);
        return successResponse(res, movement, 'Traslado reservado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear traslado', 500, error.message);
    }
};

/**
 * Confirmar o cancelar un traslado
 * PUT /api/branch-movements/:id
 */
export const updateBranchMovement = async (req: Request, res: Response) => {
    try {
        const paramValidation = branchMovementIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateBranchMovementStatusSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.id,
        };

        const { id } = paramValidation.data;
        const movement = await requestApiSalePut(`branch-movements/${id}`, updateData);
        
        const successMessage = updateData.status === 'COMPLETED' 
            ? 'Traslado completado exitosamente' 
            : 'Traslado cancelado exitosamente';

        return successResponse(res, movement, successMessage);
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar el estado del traslado', 500, error.message);
    }
};

/**
 * Traslados en bloque (Bulk Transfer)
 * POST /api/branch-movements/bulk
 */
export const createBulkTransfer = async (req: Request, res: Response) => {
    try {
        const validation = bulkTransferSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const bulkData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
        };

        if (!bulkData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }

        const result = await requestApiSalePost('branch-movements/bulk', bulkData);
        return successResponse(res, result, 'Traslado en bloque realizado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al realizar el traslado en bloque', 500, error.message);
    }
};

/**
 * Traslado total de almacén (Transfer All)
 * POST /api/branch-movements/transfer-all
 */
export const transferAll = async (req: Request, res: Response) => {
    try {
        const validation = transferAllSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const transferData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: validation.data.createdBy || req.user?.id,
        };

        if (!transferData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }

        const result = await requestApiSalePost('branch-movements/transfer-all', transferData);
        return successResponse(res, result, 'Traslado total de almacén realizado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al realizar el traslado total de almacén', 500, error.message);
    }
};
