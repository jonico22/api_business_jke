import { Request, Response } from 'express';
import {
    requestApiSaleDelete,
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut
} from '@/services/api-sales.service';
import { errorResponse, successResponse } from '@/utils/response';
import {
    createReceivedConsignmentSettlementSchema,
    listReceivedConsignmentSettlementsSchema,
    receivedConsignmentSettlementIdSchema,
    updateReceivedConsignmentSettlementSchema
} from './received-consignment-settlement.validation';

const RESOURCE_PATH = 'received-consignment-settlements';

/**
 * Obtener todas las liquidaciones recibidas de consignación
 * GET /api/received-consignment-settlements
 */
export const getReceivedConsignmentSettlements = async (req: Request, res: Response) => {
    try {
        const validation = listReceivedConsignmentSettlementsSchema.safeParse(req.query);
        if (!validation.success) {
            return errorResponse(res, 'Parámetros de búsqueda inválidos', 400, validation.error.format());
        }

        const societyCode = req.societyId || '1';
        const queryParams = new URLSearchParams({
            societyCode: societyCode.toString(),
            ...(validation.data as Record<string, string>)
        }).toString();

        const settlements = await requestApiSaleGet(`${RESOURCE_PATH}?${queryParams}`);
        return successResponse(res, settlements, 'Liquidaciones recibidas de consignación obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener liquidaciones recibidas de consignación', 500, error.message);
    }
};

/**
 * Obtener una liquidación recibida de consignación por ID
 * GET /api/received-consignment-settlements/:id
 */
export const getReceivedConsignmentSettlementById = async (req: Request, res: Response) => {
    try {
        const validation = receivedConsignmentSettlementIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const settlement = await requestApiSaleGet(`${RESOURCE_PATH}/${id}`);
        return successResponse(res, settlement, 'Liquidación recibida de consignación obtenida exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener liquidación recibida de consignación', 500, error.message);
    }
};

/**
 * Crear una liquidación recibida de consignación
 * POST /api/received-consignment-settlements
 */
export const createReceivedConsignmentSettlement = async (req: Request, res: Response) => {
    try {
        const validation = createReceivedConsignmentSettlementSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const settlementData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: validation.data.createdBy || req.user?.email || req.user?.id,
        };

        if (!settlementData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!settlementData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const settlement = await requestApiSalePost(RESOURCE_PATH, settlementData);
        return successResponse(res, settlement, 'Liquidación recibida de consignación creada exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear liquidación recibida de consignación', 500, error.message);
    }
};

/**
 * Actualizar una liquidación recibida de consignación
 * PUT /api/received-consignment-settlements/:id
 */
export const updateReceivedConsignmentSettlement = async (req: Request, res: Response) => {
    try {
        const paramValidation = receivedConsignmentSettlementIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateReceivedConsignmentSettlementSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: bodyValidation.data.updatedBy || req.user?.email || req.user?.id,
        };

        const { id } = paramValidation.data;
        const settlement = await requestApiSalePut(`${RESOURCE_PATH}/${id}`, updateData);
        return successResponse(res, settlement, 'Liquidación recibida de consignación actualizada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar liquidación recibida de consignación', 500, error.message);
    }
};

/**
 * Eliminar una liquidación recibida de consignación
 * DELETE /api/received-consignment-settlements/:id
 */
export const deleteReceivedConsignmentSettlement = async (req: Request, res: Response) => {
    try {
        const validation = receivedConsignmentSettlementIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`${RESOURCE_PATH}/${id}`, {
            updatedBy: req.user?.email || req.user?.id,
        });

        return successResponse(res, null, 'Liquidación recibida de consignación eliminada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar liquidación recibida de consignación', 500, error.message);
    }
};
