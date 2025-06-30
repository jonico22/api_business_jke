// src/core/permission/permission.controller.ts
import { Request, Response } from 'express';
import { permissionService } from './permission.service';
import { permissionSchema } from './permission.validation';
import { successResponse, errorResponse } from '@/utils/response';

export const createPermission = async (req: Request, res: Response) => {
  try {
    const data = permissionSchema.parse(req.body);
    const result = await permissionService.create(data);
    return successResponse(res, result, 'Permiso creado correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al eliminar permiso', 500, errorMessage);
  }
};

export const getPermissions = async (_req: Request, res: Response) => {
  try {
    const result = await permissionService.getAll();
    return successResponse(res, result, 'Listado de Permisos');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al listar permiso', 500, errorMessage);
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = permissionSchema.parse(req.body);
    const result = await permissionService.update(id, data);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al actualizar permiso', 500, errorMessage);
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await permissionService.remove(id);
    res.json({ message: 'Permiso eliminado' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al eliminar permiso', 500, errorMessage);
  }
};
