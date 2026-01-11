import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { categoryIdSchema } from './category.validation';

export const CategoryController = {
  getAll: async (_req: Request, res: Response) => {
    const result = await CategoryService.getAll();
    res.json(result);
  },

  getById: async (req: Request, res: Response) => {
    const id = categoryIdSchema.parse(req.params.id);
    const result = await CategoryService.getById(id);
    if (!result) return res.status(404).json({ message: 'Category not found' });
    res.json(result);
  },

  create: async (req: Request, res: Response) => {
    const result = await CategoryService.create(req.body);
    res.status(201).json(result);
  },

  update: async (req: Request, res: Response) => {
    const id = categoryIdSchema.parse(req.params.id);
    const result = await CategoryService.update(id, req.body);
    res.json(result);
  },

  delete: async (req: Request, res: Response) => {
    const id = categoryIdSchema.parse(req.params.id);
    const result = await CategoryService.delete(id);
    res.json({ message: 'Category deleted', data: result });
  },
};
