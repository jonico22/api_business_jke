import { Router } from 'express';
import {
  createPaymentTransaction,
  getAllPaymentTransactions,
  getPaymentTransactionById,
  deletePaymentTransaction
} from './paymentTransaction.controller';

const router = Router();

router.post('/', createPaymentTransaction);
router.get('/', getAllPaymentTransactions);
router.get('/:id', getPaymentTransactionById);
router.delete('/:id', deletePaymentTransaction);

export default router;