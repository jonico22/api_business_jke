import { Request, Response } from 'express';
import { requestApiSaleGet } from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * Obtener estadísticas del dashboard de ventas
 * GET /api/sales/dashboard/stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const stats = await requestApiSaleGet(`dashboard/stats?${queryParams}`);

        return successResponse(res, stats, 'Estadísticas del dashboard obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener estadísticas del dashboard', 500, error.message);
    }
};
