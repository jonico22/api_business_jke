import { Request, Response } from 'express';
import { paymentTransactionService } from './paymentTransaction.service';
import { createPaymentTransactionSchema } from './paymentTransaction.validation';

export const createPaymentTransaction = async (req: Request, res: Response) => {
  try {
    const data = createPaymentTransactionSchema.parse(req.body);
    const transaction = await paymentTransactionService.create(data);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllPaymentTransactions = async (_req: Request, res: Response) => {
  const transactions = await paymentTransactionService.findAll();
  res.json(transactions);
};

export const getPaymentTransactionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const transaction = await paymentTransactionService.findById(id);
    if (!transaction) return res.status(404).json({ message: 'No encontrado' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deletePaymentTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await paymentTransactionService.remove(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'No se pudo eliminar' });
  }
};