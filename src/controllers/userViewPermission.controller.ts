import { Request, Response } from 'express';
import prisma from '../config/database';
import { userViewPermissionSchema } from '../validations/userViewPermission.validation';

export const assignUserPermission = async (req: Request, res: Response) => {
  const validated = userViewPermissionSchema.safeParse(req.body);
  if (!validated.success) return res.status(400).json(validated.error.flatten());

  const { userId, viewId, permissionId } = req.body;

  const existing = await prisma.userViewPermission.findFirst({
    where: { userId, viewId, permissionId },
  });

  if (existing) return res.status(409).json({ message: 'Ya asignado' });

  const record = await prisma.userViewPermission.create({ data: { userId, viewId, permissionId } });

  res.status(201).json(record);
};

export const getUserPermissions = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const records = await prisma.userViewPermission.findMany({
    where: { userId },
    include: { view: true, permission: true },
  });

  res.json(records);
};

export const removeUserPermission = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.userViewPermission.delete({ where: { id } });
  res.json({ message: 'Permiso removido' });
};
