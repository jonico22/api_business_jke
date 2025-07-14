import { Request, Response } from "express";
import { currencyService } from "./currency.service";
import { createCurrencySchema, updateCurrencySchema } from "./currency.validation";

export const createCurrency = async (req: Request, res: Response) => {
  try {
    const data = createCurrencySchema.parse(req.body);
    const result = await currencyService.create(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCurrencies = async (_: Request, res: Response) => {
  const result = await currencyService.findAll();
  res.json(result);
};

export const getCurrencyById = async (req: Request, res: Response) => {
  const result = await currencyService.findById(req.params.id);
  if (!result) return res.status(404).json({ error: "Moneda no encontrada" });
  res.json(result);
};

export const updateCurrency = async (req: Request, res: Response) => {
  try {
    const data = updateCurrencySchema.parse(req.body);
    const result = await currencyService.update(req.params.id, data);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCurrency = async (req: Request, res: Response) => {
  try {
    await currencyService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
