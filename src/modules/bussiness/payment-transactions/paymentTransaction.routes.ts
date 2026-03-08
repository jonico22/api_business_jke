import { Router } from 'express';
import {
  createPaymentTransaction,
  getAllPaymentTransactions,
  getPaymentTransactionById,
  deletePaymentTransaction,
  getPendingTransactions,
  approveTransaction
} from './paymentTransaction.controller';

const router = Router();

// Rutas administrativas especiales
router.get('/pending', getPendingTransactions);
router.put('/:id/approve', approveTransaction);

router.post('/', createPaymentTransaction);
router.get('/', getAllPaymentTransactions);
router.get('/:id', getPaymentTransactionById);
router.delete('/:id', deletePaymentTransaction);

export default router;