import { Request, Response } from 'express';
import { requestApiSaleGet } from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';

type DashboardQueryValue = string | string[] | undefined;

const appendQueryParam = (params: URLSearchParams, key: string, value: DashboardQueryValue) => {
    if (value === undefined) {
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
        return;
    }

    params.append(key, value);
};

const buildDashboardQueryParams = (req: Request) => {
    const query = req.query as Record<string, DashboardQueryValue>;
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
        appendQueryParam(params, key, value);
    });

    const hasSocietyScope = params.has('societyCode') || params.has('societyId');

    if (!hasSocietyScope) {
        params.set('societyCode', (req.societyId || '1').toString());
    }

    return params.toString();
};

const proxyDashboardGet = async (
    req: Request,
    res: Response,
    path: string,
    successMessage: string,
    errorMessage: string
) => {
    try {
        const queryParams = buildDashboardQueryParams(req);
        const data = await requestApiSaleGet(`${path}?${queryParams}`);
        return successResponse(res, data, successMessage);
    } catch (error: any) {
        return errorResponse(res, errorMessage, 500, error.message);
    }
};

/**
 * Obtener estadísticas del dashboard de ventas
 * GET /api/sales/dashboard/stats
 * Query params:
 * - societyCode o societyId requerido
 * - branchId opcional
 */
export const getDashboardStats = async (req: Request, res: Response) => {
    return proxyDashboardGet(
        req,
        res,
        'dashboard/stats',
        'Estadísticas del dashboard obtenidas exitosamente',
        'Error al obtener estadísticas del dashboard'
    );
};

/**
 * Obtener overview del dashboard para gráficos compactos
 * GET /api/sales/dashboard/overview
 * Query params:
 * - societyCode o societyId requerido
 * - branchId opcional
 * - dateFrom opcional YYYY-MM-DD
 * - dateTo opcional YYYY-MM-DD
 * - granularity opcional day | week | month
 * - limit opcional
 */
export const getDashboardOverview = async (req: Request, res: Response) => {
    return proxyDashboardGet(
        req,
        res,
        'dashboard/overview',
        'Overview del dashboard obtenido exitosamente',
        'Error al obtener overview del dashboard'
    );
};

/**
 * Obtener alertas operativas de stock bajo
 * GET /api/sales/dashboard/alerts/low-stock
 * Query params:
 * - societyCode o societyId requerido
 * - branchId opcional
 * - limit opcional
 */
export const getLowStockAlerts = async (req: Request, res: Response) => {
    return proxyDashboardGet(
        req,
        res,
        'dashboard/alerts/low-stock',
        'Alertas de stock bajo obtenidas exitosamente',
        'Error al obtener alertas de stock bajo'
    );
};

/**
 * Obtener resumen de catálogo para métricas acumuladas
 * GET /api/sales/dashboard/catalog-summary
 * Query params:
 * - societyCode o societyId requerido
 * - branchId opcional
 */
export const getCatalogSummary = async (req: Request, res: Response) => {
    return proxyDashboardGet(
        req,
        res,
        'dashboard/catalog-summary',
        'Resumen de catálogo obtenido exitosamente',
        'Error al obtener resumen de catálogo'
    );
};

/**
 * Obtener rendimiento de ventas (gráfico)
 * GET /api/sales/dashboard/sales-performance
 * Legacy temporal: /api/sales/dashboard/charts/sales-performance
 */
export const getSalesPerformanceChart = async (req: Request, res: Response) => {
    return proxyDashboardGet(
        req,
        res,
        'dashboard/charts/sales-performance',
        'Rendimiento de ventas obtenido exitosamente',
        'Error al obtener rendimiento de ventas'
    );
};

/**
 * Obtener ingresos por categoría (gráfico)
 * GET /api/sales/dashboard/revenue-by-category
 * Legacy temporal: /api/sales/dashboard/charts/revenue-by-category
 */
export const getRevenueByCategoryChart = async (req: Request, res: Response) => {
    return proxyDashboardGet(
        req,
        res,
        'dashboard/charts/revenue-by-category',
        'Ingresos por categoría obtenidos exitosamente',
        'Error al obtener ingresos por categoría'
    );
};

/**
 * Obtener productos más vendidos (gráfico)
 * GET /api/sales/dashboard/top-products
 * Legacy temporal: /api/sales/dashboard/charts/top-products
 */
export const getTopProductsChart = async (req: Request, res: Response) => {
    return proxyDashboardGet(
        req,
        res,
        'dashboard/charts/top-products',
        'Productos más vendidos obtenidos exitosamente',
        'Error al obtener productos más vendidos'
    );
};

/**
 * Obtener métodos de pago (gráfico)
 * GET /api/sales/dashboard/payment-methods
 * Legacy temporal: /api/sales/dashboard/charts/payment-methods
 */
export const getPaymentMethodsChart = async (req: Request, res: Response) => {
    return proxyDashboardGet(
        req,
        res,
        'dashboard/charts/payment-methods',
        'Métodos de pago obtenidos exitosamente',
        'Error al obtener métodos de pago'
    );
};

/**
 * Obtener flujo de caja (gráfico)
 * GET /api/sales/dashboard/cash-flow
 * Legacy temporal: /api/sales/dashboard/charts/cash-flow
 */
export const getCashFlowChart = async (req: Request, res: Response) => {
    return proxyDashboardGet(
        req,
        res,
        'dashboard/charts/cash-flow',
        'Flujo de caja obtenido exitosamente',
        'Error al obtener flujo de caja'
    );
};

/**
 * Obtener rendimiento de sucursales (gráfico)
 * GET /api/sales/dashboard/branch-performance
 * Legacy temporal: /api/sales/dashboard/charts/branch-performance
 */
export const getBranchPerformanceChart = async (req: Request, res: Response) => {
    return proxyDashboardGet(
        req,
        res,
        'dashboard/charts/branch-performance',
        'Rendimiento de sucursales obtenido exitosamente',
        'Error al obtener rendimiento de sucursales'
    );
};
