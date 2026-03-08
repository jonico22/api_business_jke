import { Request, Response } from 'express';
import { requestApiSaleGet, requestApiSalePost } from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * Proxy para listar archivos de la API de ventas (Sales API)
 * GET /api/sales/files
 */
export const listExternalFiles = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1'; // Default as in other controllers

        const queryParams = new URLSearchParams({
            userId: req.user?.id || '',
            societyId: societyId.toString(),
            excludeCategory: 'REPORT', // Recomendado para la galería general
            ...(req.query as Record<string, string>) // Permite page, limit, search
        }).toString();

        // Forward request to Sales API files endpoint
        const filesData = await requestApiSaleGet(`files?${queryParams}`);

        return successResponse(res, filesData, 'Archivos listados exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al listar archivos', 500, error.message);
    }
};

/**
 * Proxy específico para listar reportes
 * Inyecta automáticamente category=REPORT y el societyId
 * GET /api/sales/files/reports
 */
export const listReports = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1'; // Default as in other controllers

        const queryParams = new URLSearchParams({
            societyId: societyId.toString(),
            category: 'REPORT',
            ...(req.query as Record<string, string>) // Permite page, limit, search
        }).toString();
        // Forward request to Sales API files endpoint
        const filesData = await requestApiSaleGet(`files?${queryParams}`);

        return successResponse(res, filesData, 'Reportes listados exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al listar reportes', 500, error.message);
    }
};

/**
 * Proxy para subir archivos a la API de ventas
 * POST /api/sales/files/upload
 */
export const uploadExternalFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No se proporcionó ningún archivo', 400);
        }

        const societyId = req.societyId || '1'; // Requerido por la API de ventas

        // Preparar FormData para enviar a la API de ventas
        const FormData = (await import('form-data')).default;
        const formData = new FormData();

        // Agregar archivo
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Enviar a la API de ventas
        // Pasamos societyId en la URL como se espera para que el backend externo cree la metadata
        const result = await requestApiSalePost(`files/upload?societyId=${societyId.toString()}`, formData);

        return successResponse(res, result, 'Archivo subido y registrado exitosamente', 201);

    } catch (error: any) {
        return errorResponse(res, 'Error al subir archivo', 500, error.message);
    }
};

/**
 * Proxy para obtener detalle de un archivo específico
 * GET /api/sales/files/:id
 */
export const getExternalFile = async (req: Request, res: Response) => {
    try {
        const fileId = req.params.id;
        const fileData = await requestApiSaleGet(`files/${fileId}`);
        return successResponse(res, fileData, 'Archivo obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener archivo', 500, error.message);
    }
};

/**
 * Proxy para registrar un archivo externo (sin subida física)
 * POST /api/sales/files
 */
export const registerExternalLink = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const payload = {
            ...req.body,
            societyId: societyId.toString(),
            uploadedById: req.user?.id || ''
        };

        const fileData = await requestApiSalePost('files', payload);
        return successResponse(res, fileData, 'Enlace externo registrado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al registrar enlace externo', 500, error.message);
    }
};

/**
 * Proxy para actualizar metadatos de un archivo (renombrar, cambiar enlace o categoría)
 * PUT /api/sales/files/:id
 */
export const updateExternalFile = async (req: Request, res: Response) => {
    try {
        const fileId = req.params.id;
        const societyId = req.societyId || '1';

        const payload = {
            ...req.body,
            societyId: societyId.toString(),
            updatedBy: req.user?.id || ''
        };

        const { requestApiSalePut } = await import('@/services/api-sales.service');
        const fileData = await requestApiSalePut(`files/${fileId}`, payload);

        return successResponse(res, fileData, 'Metadatos del archivo actualizados exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar metadatos del archivo', 500, error.message);
    }
};

/**
 * Proxy para eliminar un archivo (Limpieza Total en R2/S3 y DB)
 * DELETE /api/sales/files/:id
 */
export const deleteExternalFile = async (req: Request, res: Response) => {
    try {
        const fileId = req.params.id;

        // Pass societyId and updatedBy/deletedBy in the body for the external API logic
        const payload = {
            societyId: (req.societyId || '1').toString(),
            deletedBy: req.user?.id || ''
        };

        const { requestApiSaleDelete } = await import('@/services/api-sales.service');
        const result = await requestApiSaleDelete(`files/${fileId}`, payload);

        return successResponse(res, result, 'Archivo eliminado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar el archivo', 500, error.message);
    }
};
