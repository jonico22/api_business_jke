import { Router } from 'express';
import isAuth from '@/middlewares/auth.middleware';
import {
    getAnalyticsSummary,
    getSalesTrend,
    getCashFlowTrend,
    getSalesByCategory,
    getSalesByBranch,
    getPaymentDistribution,
    getTopProductsAnalytics,
    getLowStockAnalytics,
    getLowStockTrendAnalytics
} from './sales-analytics.controller';

const router = Router();

router.use(isAuth);

router.get('/summary', getAnalyticsSummary);
router.get('/sales/trend', getSalesTrend);
router.get('/cash-flow/trend', getCashFlowTrend);
router.get('/sales/by-category', getSalesByCategory);
router.get('/sales/by-branch', getSalesByBranch);
router.get('/payments/distribution', getPaymentDistribution);
router.get('/products/top', getTopProductsAnalytics);
router.get('/inventory/low-stock', getLowStockAnalytics);
router.get('/inventory/low-stock/trend', getLowStockTrendAnalytics);

export default router;
