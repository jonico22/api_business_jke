import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para validar que el archivo subido sea CSV o Excel
 */
export const validateCSVFile = (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No se proporcionó ningún archivo'
        });
    }

    const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel'];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            success: false,
            message: 'El archivo debe ser un CSV (.csv)',
            receivedType: req.file.mimetype
        });
    }

    next();
};
