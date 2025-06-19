import { Request, Response } from 'express';
import prisma from '../config/database';
import { roleViewPermissionSchema } from '../validations/roleViewPermission.validation';
import { clearRolePermissionCache } from '../utils/cache';

export const assignPermissionToRoleOnView = async (req: Request, res: Response) => {
  const validation = roleViewPermissionSchema.safeParse(req.body);
  if (!validation.success) return res.status(400).json(validation.error.flatten());

  const { roleId, viewId, permissionId } = req.body;

  const existing = await prisma.roleViewPermission.findFirst({
    where: { roleId, viewId, permissionId },
  });

  if (existing) return res.status(409).json({ message: 'Ya existe la asignación' });

  const record = await prisma.roleViewPermission.create({
    data: { roleId, viewId, permissionId },
  });

  clearRolePermissionCache(roleId);
  res.status(201).json(record);
};

export const getAllRoleViewPermissions = async (_req: Request, res: Response) => {
  const records = await prisma.roleViewPermission.findMany({
    include: {
      role: true,
      view: true,
      permission: true,
    },
  });

  res.json(records);
};

export const removePermissionAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await prisma.roleViewPermission.delete({ where: { id } });

  clearRolePermissionCache(record.roleId);
  res.json({ message: 'Asignación eliminada' });
};

// 🔍 Listar todos los permisos de un rol agrupado por vista
export const getPermissionsByRole = async (req: Request, res: Response) => {
  const { roleId } = req.params;

  const grouped = await prisma.roleViewPermission.findMany({
    where: { roleId },
    include: {
      view: true,
      permission: true,
    },
  });

  const result = grouped.reduce((acc: any, curr) => {
    const view = curr.view.name;
    if (!acc[view]) acc[view] = [];
    acc[view].push(curr.permission.name);
    return acc;
  }, {});

  res.json(result);
};

// 🔍 Ver si un rol tiene permiso sobre una vista específica
export const checkRolePermission = async (req: Request, res: Response) => {
  const { roleId, viewName, permissionName } = req.query;

  if (!roleId || !viewName || !permissionName)
    return res.status(400).json({ message: 'Faltan parámetros' });

  const exists = await prisma.roleViewPermission.findFirst({
    where: {
      roleId: String(roleId),
      view: { name: String(viewName) },
      permission: { name: String(permissionName) },
    },
  });

  res.json({ allowed: !!exists });
};

// 🧹 Eliminar todos los permisos de un rol sobre una vista
export const removeAllRolePermissionsFromView = async (req: Request, res: Response) => {
  const { roleId, viewId } = req.body;

  const deleted = await prisma.roleViewPermission.deleteMany({
    where: {
      roleId,
      viewId,
    },
  });

  clearRolePermissionCache(roleId);
  res.json({ message: 'Permisos eliminados', count: deleted.count });
};

// 🔁 Obtener todas las vistas permitidas para un rol
export const getViewsByRole = async (req: Request, res: Response) => {
  const { roleId } = req.params;

  const permissions = await prisma.roleViewPermission.findMany({
    where: { roleId },
    include: { view: true },
  });

  const views = [...new Map(permissions.map(p => [p.view.id, p.view])).values()];
  res.json(views);
};
