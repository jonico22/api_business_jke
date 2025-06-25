// src/core/permission/permission.controller.ts
import { Request, Response } from 'express';
import { permissionService } from './permission.service';
import { permissionSchema } from './permission.validation';

export const createPermission = async (req: Request, res: Response) => {
  try {
    const data = permissionSchema.parse(req.body);
    const result = await permissionService.create(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPermissions = async (_req: Request, res: Response) => {
  try {
    const result = await permissionService.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = permissionSchema.parse(req.body);
    const result = await permissionService.update(id, data);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await permissionService.remove(id);
    res.json({ message: 'Permiso eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
