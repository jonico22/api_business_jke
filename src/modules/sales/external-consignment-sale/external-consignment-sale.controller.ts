import { Request, Response } from 'express';
import {
    requestApiSaleDelete,
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut
} from '@/services/api-sales.service';
import { errorResponse, successResponse } from '@/utils/response';
import {
    createExternalConsignmentSaleSchema,
    externalConsignmentSaleIdSchema,
    listExternalConsignmentSalesSchema,
    updateExternalConsignmentSaleSchema
} from './external-consignment-sale.validation';

const RESOURCE_PATH = 'external-consignment-sales';

/**
 * Obtener todas las ventas externas de consignación
 * GET /api/external-consignment-sales
 */
export const getExternalConsignmentSales = async (req: Request, res: Response) => {
    try {
        const validation = listExternalConsignmentSalesSchema.safeParse(req.query);
        if (!validation.success) {
            return errorResponse(res, 'Parámetros de búsqueda inválidos', 400, validation.error.format());
        }

        const queryParams = new URLSearchParams(
            validation.data as Record<string, string>
        ).toString();

        const sales = await requestApiSaleGet(
            queryParams ? `${RESOURCE_PATH}?${queryParams}` : RESOURCE_PATH
        );
        return successResponse(res, sales, 'Ventas externas de consignación obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener ventas externas de consignación', 500, error.message);
    }
};

/**
 * Obtener una venta externa de consignación por ID
 * GET /api/external-consignment-sales/:id
 */
export const getExternalConsignmentSaleById = async (req: Request, res: Response) => {
    try {
        const validation = externalConsignmentSaleIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const sale = await requestApiSaleGet(`${RESOURCE_PATH}/${id}`);
        return successResponse(res, sale, 'Venta externa de consignación obtenida exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener venta externa de consignación', 500, error.message);
    }
};

/**
 * Crear una venta externa de consignación
 * POST /api/external-consignment-sales
 */
export const createExternalConsignmentSale = async (req: Request, res: Response) => {
    try {
        const validation = createExternalConsignmentSaleSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const saleData = {
            ...validation.data,
            netTotal: validation.data.netTotal ?? (validation.data.reportedSalePrice - validation.data.totalCommissionAmount),
            societyId: req.societyId,
            createdBy: req.user?.email || req.user?.id,
        };

        if (!saleData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!saleData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const sale = await requestApiSalePost(RESOURCE_PATH, saleData);
        return successResponse(res, sale, 'Venta externa de consignación creada exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear venta externa de consignación', 500, error.message);
    }
};

/**
 * Actualizar una venta externa de consignación
 * PUT /api/external-consignment-sales/:id
 */
export const updateExternalConsignmentSale = async (req: Request, res: Response) => {
    try {
        const paramValidation = externalConsignmentSaleIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateExternalConsignmentSaleSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const computedNetTotal = bodyValidation.data.netTotal !== undefined
            ? bodyValidation.data.netTotal
            : (
                bodyValidation.data.reportedSalePrice !== undefined &&
                bodyValidation.data.totalCommissionAmount !== undefined
            )
                ? bodyValidation.data.reportedSalePrice - bodyValidation.data.totalCommissionAmount
                : undefined;

        const updateData = {
            ...bodyValidation.data,
            ...(computedNetTotal !== undefined ? { netTotal: computedNetTotal } : {}),
            updatedBy: req.user?.email || req.user?.id,
        };

        const { id } = paramValidation.data;
        const sale = await requestApiSalePut(`${RESOURCE_PATH}/${id}`, updateData);
        return successResponse(res, sale, 'Venta externa de consignación actualizada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar venta externa de consignación', 500, error.message);
    }
};

/**
 * Eliminar una venta externa de consignación
 * DELETE /api/external-consignment-sales/:id
 */
export const deleteExternalConsignmentSale = async (req: Request, res: Response) => {
    try {
        const validation = externalConsignmentSaleIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`${RESOURCE_PATH}/${id}`, {
            updatedBy: req.user?.email || req.user?.id,
        });

        return successResponse(res, null, 'Venta externa de consignación eliminada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar venta externa de consignación', 500, error.message);
    }
};
