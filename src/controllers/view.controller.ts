import { Request, Response } from 'express';
import prisma from '../config/database';
import { viewSchema } from '../validations/view.validation';

export const createView = async (req: Request, res: Response) => {
  const validation = viewSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json(validation.error.flatten());

  const exists = await prisma.view.findUnique({ where: { name: req.body.name } });
  if (exists) return res.status(409).json({ message: 'Vista ya existe' });

  const view = await prisma.view.create({ data: req.body });
  res.status(201).json(view);
};

export const getViews = async (_req: Request, res: Response) => {
  const views = await prisma.view.findMany();
  res.json(views);
};

export const updateView = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validation = viewSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json(validation.error.flatten());

  const updated = await prisma.view.update({
    where: { id },
    data: req.body,
  });
  res.json(updated);
};

export const deleteView = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.view.delete({ where: { id } });
  res.json({ message: 'Vista eliminada' });
};
