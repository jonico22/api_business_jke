import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllRoles = async (_req: Request, res: Response) => {
  const roles = await prisma.role.findMany();
  res.json(roles);
};

export const createRole = async (req: Request, res: Response) => {
  const { name } = req.body;
  const role = await prisma.role.create({ data: { name } });
  res.status(201).json(role);
};
export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  const role = await prisma.role.update({
    where: { id: Number(id) },
    data: { name },
  });

  res.json(role);
};
export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.role.delete({ where: { id: Number(id) } });

  res.json({ message: 'Rol eliminado' });
};