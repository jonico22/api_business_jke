import { Request, Response } from "express";
import { paymentFrequencyService } from "./payment-frequency.service";
import {
  createPaymentFrequencySchema,
  updatePaymentFrequencySchema,
} from "./payment-frequency.validation";

export const createPaymentFrequency = async (req: Request, res: Response) => {
  try {
    const data = createPaymentFrequencySchema.parse(req.body);
    const result = await paymentFrequencyService.create(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPaymentFrequencies = async (_: Request, res: Response) => {
  const result = await paymentFrequencyService.findAll();
  res.json(result);
};

export const getPaymentFrequencyById = async (req: Request, res: Response) => {
  const result = await paymentFrequencyService.findById(req.params.id);
  if (!result) return res.status(404).json({ error: "No encontrado" });
  res.json(result);
};

export const updatePaymentFrequency = async (req: Request, res: Response) => {
  try {
    const data = updatePaymentFrequencySchema.parse(req.body);
    const result = await paymentFrequencyService.update(req.params.id, data);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePaymentFrequency = async (req: Request, res: Response) => {
  try {
    await paymentFrequencyService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
