import { Request, Response } from 'express';
import { requestApiSaleGet } from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { analyticsQuerySchema } from './sales-analytics.validation';

const buildAnalyticsQueryParams = (req: Request) => {
    const validation = analyticsQuerySchema.safeParse(req.query);

    if (!validation.success) {
        return {
            success: false as const,
            error: validation.error.format()
        };
    }

    const params = new URLSearchParams();
    const data = validation.data;

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined) {
            return;
        }

        params.append(key, String(value));
    });

    const hasSocietyScope = params.has('societyCode') || params.has('societyId');

    if (!hasSocietyScope) {
        params.set('societyCode', (req.societyId || '1').toString());
    }

    return {
        success: true as const,
        queryParams: params.toString()
    };
};

const proxyAnalyticsGet = async (
    req: Request,
    res: Response,
    path: string,
    successMessage: string,
    errorMessage: string
) => {
    try {
        const queryResult = buildAnalyticsQueryParams(req);

        if (!queryResult.success) {
            return errorResponse(res, 'Parámetros de búsqueda inválidos', 400, queryResult.error);
        }

        const data = await requestApiSaleGet(`${path}?${queryResult.queryParams}`);
        return successResponse(res, data, successMessage);
    } catch (error: any) {
        return errorResponse(res, errorMessage, 500, error.message);
    }
};

/**
 * Obtener resumen analítico general
 * GET /api/sales/analytics/summary
 */
export const getAnalyticsSummary = async (req: Request, res: Response) => {
    return proxyAnalyticsGet(
        req,
        res,
        'analytics/summary',
        'Resumen analítico obtenido exitosamente',
        'Error al obtener resumen analítico'
    );
};

/**
 * Obtener tendencia de ventas
 * GET /api/sales/analytics/sales/trend
 */
export const getSalesTrend = async (req: Request, res: Response) => {
    return proxyAnalyticsGet(
        req,
        res,
        'analytics/sales/trend',
        'Tendencia de ventas obtenida exitosamente',
        'Error al obtener tendencia de ventas'
    );
};

/**
 * Obtener tendencia de flujo de caja
 * GET /api/sales/analytics/cash-flow/trend
 */
export const getCashFlowTrend = async (req: Request, res: Response) => {
    return proxyAnalyticsGet(
        req,
        res,
        'analytics/cash-flow/trend',
        'Tendencia de flujo de caja obtenida exitosamente',
        'Error al obtener tendencia de flujo de caja'
    );
};

/**
 * Obtener ventas por categoría
 * GET /api/sales/analytics/sales/by-category
 */
export const getSalesByCategory = async (req: Request, res: Response) => {
    return proxyAnalyticsGet(
        req,
        res,
        'analytics/sales/by-category',
        'Ventas por categoría obtenidas exitosamente',
        'Error al obtener ventas por categoría'
    );
};

/**
 * Obtener ventas por sucursal
 * GET /api/sales/analytics/sales/by-branch
 */
export const getSalesByBranch = async (req: Request, res: Response) => {
    return proxyAnalyticsGet(
        req,
        res,
        'analytics/sales/by-branch',
        'Ventas por sucursal obtenidas exitosamente',
        'Error al obtener ventas por sucursal'
    );
};

/**
 * Obtener distribución de pagos
 * GET /api/sales/analytics/payments/distribution
 */
export const getPaymentDistribution = async (req: Request, res: Response) => {
    return proxyAnalyticsGet(
        req,
        res,
        'analytics/payments/distribution',
        'Distribución de pagos obtenida exitosamente',
        'Error al obtener distribución de pagos'
    );
};

/**
 * Obtener productos top
 * GET /api/sales/analytics/products/top
 */
export const getTopProductsAnalytics = async (req: Request, res: Response) => {
    return proxyAnalyticsGet(
        req,
        res,
        'analytics/products/top',
        'Productos top obtenidos exitosamente',
        'Error al obtener productos top'
    );
};

/**
 * Obtener inventario con stock bajo
 * GET /api/sales/analytics/inventory/low-stock
 */
export const getLowStockAnalytics = async (req: Request, res: Response) => {
    return proxyAnalyticsGet(
        req,
        res,
        'analytics/inventory/low-stock',
        'Inventario con stock bajo obtenido exitosamente',
        'Error al obtener inventario con stock bajo'
    );
};

/**
 * Obtener tendencia de inventario con stock bajo
 * GET /api/sales/analytics/inventory/low-stock/trend
 */
export const getLowStockTrendAnalytics = async (req: Request, res: Response) => {
    return proxyAnalyticsGet(
        req,
        res,
        'analytics/inventory/low-stock/trend',
        'Tendencia de inventario con stock bajo obtenida exitosamente',
        'Error al obtener tendencia de inventario con stock bajo'
    );
};
