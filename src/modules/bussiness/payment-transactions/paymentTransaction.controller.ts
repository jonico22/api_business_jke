import { Request, Response } from 'express';
import { paymentTransactionService } from './paymentTransaction.service';
import { CreatePaymentTransactionSchema } from './paymentTransaction.validation';

export const createPaymentTransaction = async (req: Request, res: Response) => {
  try {
    const validate = CreatePaymentTransactionSchema.parse(req.body);
    const transaction = await paymentTransactionService.create(validate);

    res.status(201).json(transaction);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
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

export const getPendingTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await paymentTransactionService.findPending();
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fileId } = req.body; // El Admin opcionalmente puede adjuntar el comprobante
  try {
    const result = await paymentTransactionService.approve(id, fileId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};