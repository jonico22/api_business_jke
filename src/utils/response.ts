import { Response } from 'express';

// src/shared/utils/response.ts
interface SuccessResponse<T = any> {
    success: true;
    message: string;
    data: T | null;
}

export const successResponse = (
    res: Response,
    data: any = null,
    message: string = 'Operación exitosa',
    status: number = 200
): Response<SuccessResponse> => {
    return res.status(status).json({ success: true, message, data });
};

export const errorResponse = (
  res: Response,
  message = 'Error inesperado',
  status = 500,
  errors:any 
) => {
  return res.status(status).json({ success: false, message, errors });
};
export const notFoundResponse = (
  res: Response,
  message = 'Recurso no encontrado',
  status = 404
) => {
  return res.status(status).json({ success: false, message });
};