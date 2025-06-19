import { Request, Response } from 'express';
import prisma from '../config/database';
import { permissionSchema } from '../validations/permission.validation';

export const createPermission = async (req: Request, res: Response) => {
  const validation = permissionSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json(validation.error.flatten());

  const exists = await prisma.permission.findUnique({ where: { name: req.body.name } });
  if (exists) return res.status(409).json({ message: 'Permiso ya existe' });

  const permission = await prisma.permission.create({ data: req.body });
  res.status(201).json(permission);
};

export const getPermissions = async (_req: Request, res: Response) => {
  const list = await prisma.permission.findMany();
  res.json(list);
};

export const updatePermission = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validation = permissionSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json(validation.error.flatten());

  const updated = await prisma.permission.update({
    where: { id },
    data: req.body,
  });
  res.json(updated);
};

export const deletePermission = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.permission.delete({ where: { id } });
  res.json({ message: 'Permiso eliminado' });
};
