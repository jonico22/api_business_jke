import { Request, Response } from "express";
import { planService } from "./plan.service";
import { createPlanSchema, updatePlanSchema } from "./plan.validation";

export const createPlan = async (req: Request, res: Response) => {
  try {
    const data = createPlanSchema.parse(req.body);
    const result = await planService.create(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPlans = async (_: Request, res: Response) => {
  const result = await planService.findAll();
  res.json(result);
};

export const getPlanById = async (req: Request, res: Response) => {
  const result = await planService.findById(req.params.id);
  if (!result) return res.status(404).json({ error: "Plan no encontrado" });
  res.json(result);
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const data = updatePlanSchema.parse(req.body);
    const result = await planService.update(req.params.id, data);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    await planService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
