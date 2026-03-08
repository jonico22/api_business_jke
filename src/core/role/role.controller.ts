// src/core/role/role.controller.ts
import { Request, Response } from 'express';
import { roleService } from './role.service';
import { createRoleSchema } from './role.validation';
import { successResponse, errorResponse } from '@/utils/response';

export const createRole = async (req: Request, res: Response) => {
  try {
    const data = createRoleSchema.parse(req.body);
    const result = await roleService.create(data as any);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    let roles = await roleService.getAll();
    const userRole = (req as any).role;

    if (userRole !== 'ADMIN' && userRole !== 'SUPPORT') {
      // Si quien pide la lista no es el súper admin, solo le devolvemos 
      // los roles "base" que tiene permitido asignar a sus empleados.
      const assignableCodes = ['BUSINESS_MANAGER', 'SELLER', 'STOCK_MANAGER'];
      roles = roles.filter(r => assignableCodes.includes(r.code));
    }

    return successResponse(res, roles, 'Roles listados correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return errorResponse(res, 'Error al listar roles', 500, errorMessage);
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = createRoleSchema.parse(req.body);
    const updated = await roleService.update(id, data as any);
    res.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await roleService.remove(id);
    res.json({ message: 'Rol eliminado' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const assignRolePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // roleId
    const { viewCode, permissions } = req.body; // array of permission names e.g ['READ', 'CREATE']
    const assignerId = req.user?.id;

    if (!viewCode || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: viewCode o permissions (array)' });
    }

    const result = await roleService.assignPermissionsToRole(id, viewCode, permissions, assignerId);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // roleId
    const result = await roleService.getRolePermissions(id);
    res.json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};
