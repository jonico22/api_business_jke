import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut,
    requestApiSaleDelete
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { createBranchOfficeSchema, updateBranchOfficeSchema, branchOfficeIdSchema } from './branch-office.validation';

/**
 * Obtener todas las sucursales
 * GET /api/sales/branch-offices
 */
export const getAllBranchOffices = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1'; // Fallback temporal a 1 como tenías

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(req.query as any) // Pasa page, limit, search, etc.
        }).toString();

        const branchOffices = await requestApiSaleGet(`branch-offices?${queryParams}`);
        return successResponse(res, branchOffices, 'Sucursales obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener sucursales', 500, error.message);
    }
};

/**
 * Obtener sucursales para select/dropdown
 * GET /api/sales/branch-offices/select
 */
export const getBranchOfficesForSelect = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const branchOffices = await requestApiSaleGet(`branch-offices/select?societyCode=${societyId}`);
        return successResponse(res, branchOffices, 'Sucursales para select obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener sucursales para select', 500, error.message);
    }
};

/**
 * Obtener sucursales creadas por usuarios
 * GET /api/sales/branch-offices/created-by-users
 */
export const getCreatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const branchOffices = await requestApiSaleGet(`branch-offices/created-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos.
        // La API devuelve un array de IDs (strings).
        const userIds = [...new Set(branchOffices)];

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
            return successResponse(res, users, 'Usuarios que han creado sucursales obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan creado sucursales');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios creadores', 500, error.message);
    }
};

/**
 * Obtener sucursales actualizadas por usuarios
 * GET /api/sales/branch-offices/updated-by-users
 */
export const getUpdatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const branchOffices = await requestApiSaleGet(`branch-offices/updated-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos.
        // La API devuelve un array de IDs (strings), no objetos.
        const userIds = [...new Set(branchOffices)];

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
            return successResponse(res, users, 'Usuarios que han actualizado sucursales obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan actualizado sucursales');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios', 500, error.message);
    }
};

/**
 * Obtener una sucursal por ID
 * GET /api/sales/branch-offices/:id
 */
export const getBranchOfficeById = async (req: Request, res: Response) => {
    try {
        const validation = branchOfficeIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const branchOffice = await requestApiSaleGet(`branch-offices/${id}`);
        return successResponse(res, branchOffice, 'Sucursal obtenida exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener sucursal', 500, error.message);
    }
};

/**
 * Crear una nueva sucursal
 * POST /api/sales/branch-offices
 */
export const createBranchOffice = async (req: Request, res: Response) => {
    try {
        const validation = createBranchOfficeSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const branchData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
        };

        if (!branchData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!branchData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const branchOffice = await requestApiSalePost('branch-offices', branchData);
        return successResponse(res, branchOffice, 'Sucursal creada exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear sucursal', 500, error.message);
    }
};

/**
 * Actualizar una sucursal
 * PUT /api/sales/branch-offices/:id
 */
export const updateBranchOffice = async (req: Request, res: Response) => {
    try {
        const paramValidation = branchOfficeIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateBranchOfficeSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.id,
        };

        const { id } = paramValidation.data;
        const branchOffice = await requestApiSalePut(`branch-offices/${id}`, updateData);
        return successResponse(res, branchOffice, 'Sucursal actualizada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar sucursal', 500, error.message);
    }
};

/**
 * Eliminar una sucursal
 * DELETE /api/sales/branch-offices/:id
 */
export const deleteBranchOffice = async (req: Request, res: Response) => {
    try {
        const validation = branchOfficeIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`branch-offices/${id}`, {
            updatedBy: req.user?.id,
        });

        return successResponse(res, null, 'Sucursal eliminada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar sucursal', 500, error.message);
    }
};
