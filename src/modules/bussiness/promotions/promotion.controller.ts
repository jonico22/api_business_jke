import { Request, Response } from "express";
import { promotionService } from "./promotion.service";
import { createPromotionSchema } from "./promotion.validation";

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const data = createPromotionSchema.parse(req.body);
    const result = await promotionService.create(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPromotions = async (_: Request, res: Response) => {
  const result = await promotionService.findAll();
  res.json(result);
};

export const getPromotionById = async (req: Request, res: Response) => {
  const result = await promotionService.findById(req.params.id);
  if (!result) return res.status(404).json({ error: "Promoción no encontrada" });
  res.json(result);
};

export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const result = await promotionService.update(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePromotion = async (req: Request, res: Response) => {
  try {
    await promotionService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
