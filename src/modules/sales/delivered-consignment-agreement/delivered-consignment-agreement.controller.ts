import { Request, Response } from 'express';
import {
    requestApiSaleDelete,
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut
} from '@/services/api-sales.service';
import { errorResponse, successResponse } from '@/utils/response';
import {
    createDeliveredConsignmentAgreementSchema,
    deliveredConsignmentAgreementIdSchema,
    listDeliveredConsignmentAgreementsSchema,
    updateDeliveredConsignmentAgreementSchema
} from './delivered-consignment-agreement.validation';

const RESOURCE_PATH = 'delivered-consignment-agreements';

/**
 * Obtener todas las entregas de productos en consignación
 * GET /api/delivered-consignment-agreements
 */
export const getDeliveredConsignmentAgreements = async (req: Request, res: Response) => {
    try {
        const validation = listDeliveredConsignmentAgreementsSchema.safeParse(req.query);
        if (!validation.success) {
            return errorResponse(res, 'Parámetros de búsqueda inválidos', 400, validation.error.format());
        }

        const societyCode = req.societyId || '1';
        const queryParams = new URLSearchParams({
            societyCode: societyCode.toString(),
            ...(validation.data as Record<string, string>)
        }).toString();

        const deliveries = await requestApiSaleGet(`${RESOURCE_PATH}?${queryParams}`);
        return successResponse(res, deliveries, 'Entregas de productos en consignación obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener entregas de productos en consignación', 500, error.message);
    }
};

/**
 * Obtener una entrega de productos en consignación por ID
 * GET /api/delivered-consignment-agreements/:id
 */
export const getDeliveredConsignmentAgreementById = async (req: Request, res: Response) => {
    try {
        const validation = deliveredConsignmentAgreementIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const delivery = await requestApiSaleGet(`${RESOURCE_PATH}/${id}`);
        return successResponse(res, delivery, 'Entrega de productos en consignación obtenida exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener entrega de productos en consignación', 500, error.message);
    }
};

/**
 * Crear una entrega de productos en consignación
 * POST /api/delivered-consignment-agreements
 */
export const createDeliveredConsignmentAgreement = async (req: Request, res: Response) => {
    try {
        const validation = createDeliveredConsignmentAgreementSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const deliveryData = {
            ...validation.data,
            remainingStock: validation.data.remainingStock ?? validation.data.deliveredStock,
            totalCost: validation.data.totalCost ?? (validation.data.deliveredStock * validation.data.costPrice),
            totalValue: validation.data.totalValue ?? (validation.data.deliveredStock * validation.data.suggestedSalePrice),
            societyId: req.societyId,
            createdBy: req.user?.email || req.user?.id,
        };

        if (!deliveryData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!deliveryData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const delivery = await requestApiSalePost(RESOURCE_PATH, deliveryData);
        return successResponse(res, delivery, 'Entrega de productos en consignación creada exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear entrega de productos en consignación', 500, error.message);
    }
};

/**
 * Actualizar una entrega de productos en consignación
 * PUT /api/delivered-consignment-agreements/:id
 */
export const updateDeliveredConsignmentAgreement = async (req: Request, res: Response) => {
    try {
        const paramValidation = deliveredConsignmentAgreementIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateDeliveredConsignmentAgreementSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.email || req.user?.id,
        };

        const { id } = paramValidation.data;
        const delivery = await requestApiSalePut(`${RESOURCE_PATH}/${id}`, updateData);
        return successResponse(res, delivery, 'Entrega de productos en consignación actualizada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar entrega de productos en consignación', 500, error.message);
    }
};

/**
 * Eliminar una entrega de productos en consignación
 * DELETE /api/delivered-consignment-agreements/:id
 */
export const deleteDeliveredConsignmentAgreement = async (req: Request, res: Response) => {
    try {
        const validation = deliveredConsignmentAgreementIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`${RESOURCE_PATH}/${id}`, {
            updatedBy: req.user?.email || req.user?.id,
        });

        return successResponse(res, null, 'Entrega de productos en consignación eliminada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar entrega de productos en consignación', 500, error.message);
    }
};
