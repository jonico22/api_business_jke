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

/**
 * Obtener rendimiento de ventas (gráfico)
 * GET /api/sales/dashboard/charts/sales-performance
 */
export const getSalesPerformanceChart = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const queryParams = new URLSearchParams({ societyCode: societyId.toString(), ...(req.query as any) }).toString();
        const data = await requestApiSaleGet(`dashboard/charts/sales-performance?${queryParams}`);
        return successResponse(res, data, 'Rendimiento de ventas obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener rendimiento de ventas', 500, error.message);
    }
};

/**
 * Obtener ingresos por categoría (gráfico)
 * GET /api/sales/dashboard/charts/revenue-by-category
 */
export const getRevenueByCategoryChart = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const queryParams = new URLSearchParams({ societyCode: societyId.toString(), ...(req.query as any) }).toString();
        const data = await requestApiSaleGet(`dashboard/charts/revenue-by-category?${queryParams}`);
        return successResponse(res, data, 'Ingresos por categoría obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener ingresos por categoría', 500, error.message);
    }
};

/**
 * Obtener productos más vendidos (gráfico)
 * GET /api/sales/dashboard/charts/top-products
 */
export const getTopProductsChart = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const queryParams = new URLSearchParams({ societyCode: societyId.toString(), ...(req.query as any) }).toString();
        const data = await requestApiSaleGet(`dashboard/charts/top-products?${queryParams}`);
        return successResponse(res, data, 'Productos más vendidos obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener productos más vendidos', 500, error.message);
    }
};

/**
 * Obtener métodos de pago (gráfico)
 * GET /api/sales/dashboard/charts/payment-methods
 */
export const getPaymentMethodsChart = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const queryParams = new URLSearchParams({ societyCode: societyId.toString(), ...(req.query as any) }).toString();
        const data = await requestApiSaleGet(`dashboard/charts/payment-methods?${queryParams}`);
        return successResponse(res, data, 'Métodos de pago obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener métodos de pago', 500, error.message);
    }
};

/**
 * Obtener flujo de caja (gráfico)
 * GET /api/sales/dashboard/charts/cash-flow
 */
export const getCashFlowChart = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const queryParams = new URLSearchParams({ societyCode: societyId.toString(), ...(req.query as any) }).toString();
        const data = await requestApiSaleGet(`dashboard/charts/cash-flow?${queryParams}`);
        return successResponse(res, data, 'Flujo de caja obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener flujo de caja', 500, error.message);
    }
};

/**
 * Obtener rendimiento de sucursales (gráfico)
 * GET /api/sales/dashboard/charts/branch-performance
 */
export const getBranchPerformanceChart = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const queryParams = new URLSearchParams({ societyCode: societyId.toString(), ...(req.query as any) }).toString();
        const data = await requestApiSaleGet(`dashboard/charts/branch-performance?${queryParams}`);
        return successResponse(res, data, 'Rendimiento de sucursales obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener rendimiento de sucursales', 500, error.message);
    }
};
