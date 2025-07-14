import { Router } from 'express';
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

const router = Router();

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
router.use('/payment-transactions', paymentTransactionRoutes);
router.use("/receipts", receiptRoutes);

export default router;

