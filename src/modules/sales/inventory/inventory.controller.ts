import { Request, Response } from 'express';
import { requestApiSaleGet, requestApiSalePost } from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { kardexQuerySchema, stockAdjustmentSchema } from './inventory.validation';

/**
 * Obtener Kardex / Historial de Movimientos
 * GET /api/inventory/kardex
 */
export const getKardex = async (req: Request, res: Response) => {
    try {
        const validation = kardexQuerySchema.safeParse(req.query);
        if (!validation.success) {
            return errorResponse(res, 'Parámetros de consulta inválidos', 400, validation.error.format());
        }

        const societyId = req.societyId || '1';
        
        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(validation.data as any)
        }).toString();

        const transactions = await requestApiSaleGet(`inventory/kardex?${queryParams}`);
        return successResponse(res, transactions, 'Historial de movimientos (Kardex) obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener historial de movimientos', 500, error.message);
    }
};

/**
 * Crear ajuste manual de stock
 * POST /api/inventory/adjustment
 */
export const createAdjustment = async (req: Request, res: Response) => {
    try {
        const validation = stockAdjustmentSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos de ajuste inválidos', 400, validation.error.format());
        }

        const adjustmentData = {
            ...validation.data,
            societyId: req.societyId,
            userId: req.user?.id,
        };

        if (!adjustmentData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }

        const result = await requestApiSalePost('inventory/adjustment', adjustmentData);
        return successResponse(res, result, 'Ajuste de stock realizado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al realizar el ajuste de stock', 500, error.message);
    }
};
