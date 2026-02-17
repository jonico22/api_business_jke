import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '@/utils/AppError';

export const validateRequest = (schema: AnyZodObject) => (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (err: any) {
        if (err instanceof ZodError) {
            const errorMessages = err.errors.map((error) => error.message).join(', ');
            return next(new AppError(errorMessages, 400));
        }
        next(err);
    }
};

export const validateId = (schema: AnyZodObject) => (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        schema.parse({
            params: req.params,
        });
        next();
    } catch (err: any) {
        if (err instanceof ZodError) {
            const errorMessages = err.errors.map((error) => error.message).join(', ');
            return next(new AppError(errorMessages, 400));
        }
        next(err);
    }
};
