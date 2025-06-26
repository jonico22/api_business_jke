import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const isDev = process.env.NODE_ENV !== 'production';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  let errors = null;

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (isDev) {
    // Mostrar detalles en desarrollo
    return res.status(status).json({
      success: false,
      message,
      error: err,
      stack: err.stack,
    });
  }

  // Producción: mensaje limpio
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};
