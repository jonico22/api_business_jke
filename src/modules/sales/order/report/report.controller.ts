import { Request, Response } from 'express';
import { requestApiSaleGet } from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * Generar reporte de ordenes
 * GET /api/sales/orders/reports
 */
export const getReport = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            userId: req.user?.id || '',
            ...(req.query as any)
        }).toString();

        // Forward request to Sales API report endpoint
        // Adjust the endpoint path 'reports' based on the actual Sales API implementation
        const reportData = await requestApiSaleGet(`orders/report?${queryParams}`);

        return successResponse(res, reportData, 'Reporte generado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al generar reporte', 500, error.message);
    }
};
