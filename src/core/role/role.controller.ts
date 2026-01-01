// src/core/role/role.controller.ts
import { Request, Response } from 'express';
import { roleService } from './role.service';
import { createRoleSchema } from './role.validation';

export const createRole = async (req: Request, res: Response) => {
  try {
    const data = createRoleSchema.parse(req.body);
    const result = await roleService.create(data);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await roleService.getAll();
    res.json(roles);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = createRoleSchema.parse(req.body);
    const updated = await roleService.update(id, data);
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
