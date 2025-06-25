// src/core/view/view.controller.ts
import { Request, Response } from 'express';
import { viewService } from './view.service';
import { viewSchema } from './view.validation';

export const createView = async (req: Request, res: Response) => {
  try {
    const data = viewSchema.parse(req.body);
    const result = await viewService.create(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getViews = async (_req: Request, res: Response) => {
  try {
    const result = await viewService.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = viewSchema.parse(req.body);
    const result = await viewService.update(id, data);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await viewService.remove(id);
    res.json({ message: 'Vista eliminada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
