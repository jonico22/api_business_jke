import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut,
    requestApiSaleDelete
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { createSocietySchema, updateSocietySchema, societyIdSchema } from './society.validation';

/**
 * Obtener todas las sociedades
 * GET /api/sales/societies
 */
export const getAllSocieties = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const societies = await requestApiSaleGet(`societies?${queryParams}`);
        return successResponse(res, societies, 'Sociedades obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener sociedades', 500, error.message);
    }
};

/**
 * Obtener sociedades para select/dropdown
 * GET /api/sales/societies/select
 */
export const getSocietiesForSelect = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const societies = await requestApiSaleGet(`societies/select?societyCode=${societyId}`);
        return successResponse(res, societies, 'Sociedades para select obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener sociedades para select', 500, error.message);
    }
};

/**
 * Obtener sociedades creadas por usuarios
 * GET /api/sales/societies/created-by-users
 */
export const getCreatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const societies = await requestApiSaleGet(`societies/created-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos
        const userIds = [...new Set(societies)];

        // 3. Consultar nombres de usuarios en Prisma
        if (userIds.length > 0) {
            const users = await prisma.user.findMany({
                where: {
                    id: { in: userIds as string[] }
                },
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            });

            // 4. Devolver solo la lista de usuarios
            return successResponse(res, users, 'Usuarios que han creado sociedades obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan creado sociedades');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios creadores', 500, error.message);
    }
};

/**
 * Obtener sociedades actualizadas por usuarios
 * GET /api/sales/societies/updated-by-users
 */
export const getUpdatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const societies = await requestApiSaleGet(`societies/updated-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos (updatedBy)
        const userIds = [...new Set(societies)];

        // 3. Consultar nombres de usuarios en Prisma
        if (userIds.length > 0) {
            const users = await prisma.user.findMany({
                where: {
                    id: { in: userIds as string[] }
                },
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            });

            // 4. Devolver solo la lista de usuarios
            return successResponse(res, users, 'Usuarios que han actualizado sociedades obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan actualizado sociedades');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios', 500, error.message);
    }
};

/**
 * Obtener la sociedad actual del usuario
 * GET /api/sales/societies/current
 */
export const getSocietyById = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId;
        if (!societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        const society = await requestApiSaleGet(`societies/current?societyCode=${societyId}`);
        return successResponse(res, society, 'Sociedad obtenida exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener sociedad', 500, error.message);
    }
};

/**
 * Crear una nueva sociedad
 * POST /api/sales/societies
 */
export const createSociety = async (req: Request, res: Response) => {
    try {
        const validation = createSocietySchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const societyData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
        };

        if (!societyData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!societyData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const society = await requestApiSalePost('societies', societyData);
        return successResponse(res, society, 'Sociedad creada exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear sociedad', 500, error.message);
    }
};

/**
 * Actualizar una sociedad
 * PUT /api/sales/societies/:id
 */
export const updateSociety = async (req: Request, res: Response) => {
    try {
        const paramValidation = societyIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateSocietySchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.id,
        };

        const { id } = paramValidation.data;
        const society = await requestApiSalePut(`societies/${id}`, updateData);
        return successResponse(res, society, 'Sociedad actualizada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar sociedad', 500, error.message);
    }
};

/**
 * Eliminar una sociedad
 * DELETE /api/sales/societies/:id
 */
export const deleteSociety = async (req: Request, res: Response) => {
    try {
        const validation = societyIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`societies/${id}`, {
            updatedBy: req.user?.id,
        });

        return successResponse(res, null, 'Sociedad eliminada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar sociedad', 500, error.message);
    }
};
