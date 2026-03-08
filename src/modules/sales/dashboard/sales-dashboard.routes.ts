import { Router } from 'express';
import isAuth from '@/middlewares/auth.middleware';
import {
    getDashboardStats,
    getSalesPerformanceChart,
    getRevenueByCategoryChart,
    getTopProductsChart,
    getPaymentMethodsChart,
    getCashFlowChart,
    getBranchPerformanceChart
} from './sales-dashboard.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(isAuth);

router.get('/stats', getDashboardStats);

router.get('/charts/sales-performance', getSalesPerformanceChart);
router.get('/charts/revenue-by-category', getRevenueByCategoryChart);
router.get('/charts/top-products', getTopProductsChart);
router.get('/charts/payment-methods', getPaymentMethodsChart);
router.get('/charts/cash-flow', getCashFlowChart);
router.get('/charts/branch-performance', getBranchPerformanceChart);

export default router;
