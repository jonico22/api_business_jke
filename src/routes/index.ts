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
import requestRoutes from '@/modules/bussiness/request/request.routes';
import reasonRoutes from '@/modules/bussiness/reasonForRejection/reasonForRejection.route'
import tax from '@/modules/bussiness/tax/tax.route';
import receiptType from '@/modules/bussiness/receiptType/receiptType.route';
import subscriptionMovementRoutes from '@/modules/bussiness/subscriptionMovement/subscriptionMovement.routes';
import tariffRoutes from '@/modules/bussiness/tariff/tariff.routes';

import societyRoutes from '@/modules/customer/society/society.route';
import productRoutes from '@/modules/customer/product/product.route';
import branchOfficeRoutes from '@/modules/customer/branchOffice/branchoffice.route';
import branchOfficeProductRoutes from '@/modules/customer/branchOfficeProduct/branchofficeproduct.route';
import purchaseDetailRoutes from '@/modules/customer/purchaseDetail/purchaseDetail.routes';
import purchaseRoutes from '@/modules/customer/purchase/purchase.routes';

import orderRoutes from '@/modules/customer/order/order.route';
import orderItemRoutes from '@/modules/customer/orderItem/orderItem.route';
import orderPaymentRoutes from '@/modules/customer/orderPayment/orderPayment.route';
import societyReceiptRoutes from '@/modules/customer/societyReceipt/societyReceipt.routes';
import outgoingConsignmentAgreementRoutes from '@/modules/customer/outgoingConsignmentAgreement/outgoingConsignmentAgreement.route';
import deliveredConsignmentAgreementRoutes from '@/modules/customer/deliveredConsignmentAgreement/deliveredConsignmentAgreement.route';
import receivedConsignmentSettlementRoutes from '@/modules/customer/receivedConsignmentSettlement/receivedConsignmentSettlement.route';


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
router.use('/requests', requestRoutes);
router.use('/rejection-reasons', reasonRoutes)
router.use('/taxes', tax);
router.use('/receipt-types', receiptType);
router.use('/subscription-movements', subscriptionMovementRoutes);
router.use('/tariffs', tariffRoutes);

// modulo de clientes
router.use('/societies', societyRoutes);
router.use('/products', productRoutes);
router.use('/branch-offices', branchOfficeRoutes);
router.use('/branch-office-products', branchOfficeProductRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/purchase-details', purchaseDetailRoutes);
router.use('/orders', orderRoutes);
router.use('/order-items', orderItemRoutes);
router.use('/order-payments', orderPaymentRoutes);
router.use('/society-receipts', societyReceiptRoutes);
router.use('/outgoing-consignment-agreements', outgoingConsignmentAgreementRoutes);
router.use('/delivered-consignment-agreements', deliveredConsignmentAgreementRoutes);
router.use('/received-consignment-settlements', receivedConsignmentSettlementRoutes);

export default router;

