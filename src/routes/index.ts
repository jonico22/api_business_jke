import { Router } from 'express';
import express from 'express';
import authRoutes from '@/core/auth/auth.routes';
import userRoutes from '@/core/user/user.routes';
import roleRoutes from '@/core/role/role.routes';
import permissionRoutes from '@/core/permission/permission.routes';
import viewRoutes from '@/core/view/view.routes';
import dashboard from '@/core/dashboard/dashboard.routes'

import serviceRoutes from '@/modules/bussiness/services/service.routes';
import paymentFrequencyRoutes from '@/modules/bussiness/payment-frequency/payment-frequency.routes';
import currencyRoutes from "@/modules/bussiness/currency/currency.routes";
import planRoutes from "@/modules/bussiness/plans/plan.routes";
import promotionRoutes from "@/modules/bussiness/promotions/promotion.routes";
import subscriptionRoutes from "@/modules/bussiness/subscriptions/subscription.routes";
import authorizedUserSubscriptionRoutes from '@/modules/bussiness/authorized-subscription/authorizedUserSubscription.routes';
import paymentTransactionRoutes from '@/modules/bussiness/payment-transactions/paymentTransaction.routes';
import receiptRoutes from "@/modules/bussiness/receipt/receipt.route";
import requestRoutes from '@/modules/bussiness/request/request.routes';
import reasonRoutes from '@/modules/bussiness/reasonForRejection/reasonForRejection.route'
import tax from '@/modules/bussiness/tax/tax.route';
import receiptType from '@/modules/bussiness/receiptType/receiptType.route';
import subscriptionMovementRoutes from '@/modules/bussiness/subscriptionMovement/subscriptionMovement.routes';
import tariffRoutes from '@/modules/bussiness/tariff/tariff.routes';
import files from '@/modules/bussiness/files/file.routes';

//modulo de ventas
import categoryRoutes from '@/modules/sales/category/category.routes';
import productRoutes from '@/modules/sales/product/product.routes';
import clientRoutes from '@/modules/sales/client/client.routes';
import branchOfficeRoutes from '@/modules/sales/branch-office/branch-office.routes';
import salesCurrencyRoutes from '@/modules/sales/currency/currency.routes';
import societyRoutes from '@/modules/sales/society/society.routes';
import orderRoutes from '@/modules/sales/order/order.routes';
import orderItemRoutes from '@/modules/sales/order-item/order-item.routes';
import orderPaymentRoutes from '@/modules/sales/order-payment/order-payment.routes';
import favoriteRoutes from '@/modules/sales/favorite/favorite.routes';
import salesDashboardRoutes from '@/modules/sales/dashboard/sales-dashboard.routes';
import notificationRoutes from '@/modules/core/notification/notification.routes';
import { setupRateLimiter } from '@/config/rateLimit';

const router = Router();
const limiter = setupRateLimiter();

// IMPORTANT: Routes that handle file uploads MUST be registered BEFORE express.json()
// This prevents express.json() from interfering with multipart/form-data parsing

// 1. Notificaciones: Maneja su propio Rate Limit + Caché
router.use('/notifications', notificationRoutes);

// 2. Global Rate Limiter para el resto de rutas
router.use(limiter);



//modulo de ventas
// File upload routes registered BEFORE express.json()
router.use('/sales/products', productRoutes);
router.use('/sales/categories', categoryRoutes);
router.use('/files', files);

// Apply express.json() AFTER file upload routes to prevent interference with multipart/form-data
router.use(express.json());

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/views', viewRoutes);
router.use('/dashboard', dashboard);

//modulo de suscripcion
router.use('/services', serviceRoutes);
router.use('/payment-frequencies', paymentFrequencyRoutes);
router.use("/currencies", currencyRoutes);
router.use("/promotions", promotionRoutes);
router.use("/plans", planRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use('/authorized-users', authorizedUserSubscriptionRoutes);
router.use('/payment-transactions', paymentTransactionRoutes);
router.use("/receipts", receiptRoutes);
router.use('/requests', requestRoutes);
router.use('/rejection-reasons', reasonRoutes)
router.use('/taxes', tax);
router.use('/receipt-types', receiptType);
router.use('/subscription-movements', subscriptionMovementRoutes);
router.use('/tariffs', tariffRoutes);
// All other routes that need JSON parsing

router.use('/sales/clients', clientRoutes);
router.use('/sales/branch-offices', branchOfficeRoutes);
router.use('/sales/currencies', salesCurrencyRoutes);
router.use('/sales/societies', societyRoutes);
import reportRoutes from '@/modules/sales/order/report/report.routes';

// ... other imports

router.use('/sales/orders/reports', reportRoutes); // Report route MUST be before generic order routes
router.use('/sales/orders', orderRoutes);
router.use('/sales/order-items', orderItemRoutes);
router.use('/sales/order-items', orderItemRoutes);
router.use('/sales/order-items', orderItemRoutes);
router.use('/sales/order-payments', orderPaymentRoutes);
router.use('/sales/favorites', favoriteRoutes);
router.use('/sales/dashboard', salesDashboardRoutes);
// router.use('/notifications', notificationRoutes); // Moved up

export default router;
