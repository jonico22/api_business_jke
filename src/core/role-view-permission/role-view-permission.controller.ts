// src/core/role_view_permission/role-view-permission.controller.ts
import { Request, Response } from 'express';
import { roleViewPermissionService } from './role-view-permission.service';
import { roleViewPermissionSchema } from './role-view-permission.validation';


export const assignRoleViewPermission = async (req: Request, res: Response) => {
  try {
    const validation = roleViewPermissionSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json(validation.error.flatten());
    const result = await roleViewPermissionService.assign(validation.data);
    res.status(201).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
};

export const getAllRoleViewPermissions = async (_req: Request, res: Response) => {
  try {
    const result = await roleViewPermissionService.getAll();
    res.json(result);
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};

export const removeRoleViewPermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await roleViewPermissionService.remove(id);
    res.json({ message: 'Permiso de vista por rol eliminado' });
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
};

// 🔍 Listar todos los permisos de un rol agrupado por vista
export const getPermissionsByRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const result = await roleViewPermissionService.getPermissionsByRole(roleId);
    res.json(result);
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};

// 🔍 Ver si un rol tiene permiso sobre una vista específica
export const checkRolePermission = async (req: Request, res: Response) => {
  try {
    const { roleId, viewName, permissionName } = req.query;
    if (
      typeof roleId !== 'string' ||
      typeof viewName !== 'string' ||
      typeof permissionName !== 'string'
    ) {
      return res.status(400).json({ message: 'Faltan parámetros' });
    }

    const hasPermission = await roleViewPermissionService.checkRolePermission(roleId, viewName, permissionName);
    res.json({ allowed: hasPermission });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}

// 🧹 Eliminar todos los permisos de un rol sobre una vista
export const removeAllRolePermissionsFromView = async (req: Request, res: Response) => {
  try {
    const { roleId, viewId } = req.body;
    await roleViewPermissionService.removeAllRolePermissionsFromView(roleId, viewId);
    res.json({ message: 'Todos los permisos del rol sobre la vista han sido eliminados' });
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};

// 🔁 Obtener todas las vistas permitidas para un rol
export const getViewsByRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const result = await roleViewPermissionService.getViewsByRole(roleId);
    res.json(result);
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};