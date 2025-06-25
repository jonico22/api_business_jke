// src/core/user_view/user-view.controller.ts
import { Request, Response } from 'express';
import { userViewService } from './user-view.service';
import { userViewSchema } from './user-view.validation';

export const assignUserViewPermission = async (req: Request, res: Response) => {
  try {
    const validated = userViewSchema.safeParse(req.body);
    if (!validated.success) return res.status(400).json(validated.error.flatten());
    const result = await userViewService.assign(validated.data);
    res.status(201).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
};

export const getAllUserViewPermissions = async (req: Request, res: Response) => {
  try {
    const result = await userViewService.getAll();
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};

export const getUserViewPermissions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const result = await userViewService.getByUserPermission(userId);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';  
    res.status(500).json({ error: errorMessage });
  }
}

export const removeUserViewPermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userViewService.remove(id);
    res.json({ message: 'Permiso de vista de usuario eliminado' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: errorMessage });
  }
};