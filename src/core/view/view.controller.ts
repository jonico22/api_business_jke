// src/core/view/view.controller.ts
import { Request, Response } from 'express';
import { viewService } from './view.service';
import { viewSchema } from './view.validation';
import { successResponse, errorResponse } from '@/utils/response';

export const createView = async (req: Request, res: Response) => {
  try {
    const data = viewSchema.parse(req.body);
    const result = await viewService.create(data);
    return successResponse(res, result, 'Vista creado correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al eliminar vista', 500, errorMessage);
  }
};

export const getViews = async (_req: Request, res: Response) => {
  try {
    const result = await viewService.getAll();
   return successResponse(res, result, 'Listado de Vistas correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error  ver listado vista', 500, errorMessage);
  }
};

export const updateView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = viewSchema.parse(req.body);
    const result = await viewService.update(id, data);
    return successResponse(res, result, 'Actualizar de Vistas correctamente');
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al actualizar vista', 500, errorMessage);
  }
};

export const deleteView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await viewService.remove(id);
    return successResponse(res, 'Eliminar Vista correctamente');
  } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al eliminar vista', 500, errorMessage);
  }
};
