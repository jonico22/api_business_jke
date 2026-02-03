import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut,
    requestApiSaleDelete
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { createCategorySchema, updateCategorySchema, categoryIdSchema } from './category.validation';

/**
 * Obtener todas las categorías
 * GET /api/sales/categories
 */
export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1'; // Fallback temporal a 1 como tenías

        // Convertir societyId y query params a URLSearchParams
        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(req.query as any) // Pasa page, limit, search, etc.
        }).toString();

        const categories = await requestApiSaleGet(`categories?${queryParams}`);
        return successResponse(res, categories, 'Categorías obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener categorías', 500, error.message);
    }
};

/**
 * Obtener categorías para select/dropdown
 * GET /api/sales/categories/select
 */
export const getCategoriesForSelect = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const categories = await requestApiSaleGet(`categories/select?societyCode=${societyId}`);
        return successResponse(res, categories, 'Categorías para select obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener categorías para select', 500, error.message);
    }
};



/**
 * Obtener categorías creadas por usuarios
 * GET /api/sales/categories/created-by-users
 */
export const getCreatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const categories = await requestApiSaleGet(`categories/created-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos.
        // La API devuelve un array de IDs (strings).
        const userIds = [...new Set(categories)];

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
            return successResponse(res, users, 'Usuarios que han creado categorías obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan creado categorías');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios creadores', 500, error.message);
    }
};

/**
 * Obtener categorías actualizadas por usuarios
 * GET /api/sales/categories/updated-by-users
 */
export const getUpdatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const categories = await requestApiSaleGet(`categories/updated-by-users?societyId=${societyId}`);
        // 2. Extraer IDs de usuarios únicos.
        // La API devuelve un array de IDs (strings), no objetos.
        const userIds = [...new Set(categories)];
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
            return successResponse(res, users, 'Usuarios que han actualizado categorías obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan actualizado categorías');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios', 500, error.message);
    }
};

/**
 * Obtener una categoría por ID
 * GET /api/sales/categories/:id
 */
export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const validation = categoryIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const category = await requestApiSaleGet(`categories/${id}`);
        return successResponse(res, category, 'Categoría obtenida exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener categoría', 500, error.message);
    }
};

/**
 * Crear una nueva categoría
 * POST /api/sales/categories
 */
export const createCategory = async (req: Request, res: Response) => {
    try {
        // Validar datos de entrada
        const validation = createCategorySchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        // Inyectar societyId y createdBy desde el request autenticado
        const categoryData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
        };

        // Validar que existan los datos requeridos
        if (!categoryData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!categoryData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }
        const category = await requestApiSalePost('categories', categoryData);
        return successResponse(res, category, 'Categoría creada exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear categoría', 500, error.message);
    }
};

/**
 * Actualizar una categoría
 * PUT /api/sales/categories/:id
 */
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const paramValidation = categoryIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateCategorySchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        // Inyectar updatedBy desde el request autenticado
        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.id,
        };

        const { id } = paramValidation.data;
        const category = await requestApiSalePut(`categories/${id}`, updateData);
        return successResponse(res, category, 'Categoría actualizada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar categoría', 500, error.message);
    }
};

/**
 * Eliminar una categoría
 * DELETE /api/sales/categories/:id
 */
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const validation = categoryIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        // Enviar updatedBy en el body del DELETE request
        await requestApiSaleDelete(`categories/${id}`, {
            updatedBy: req.user?.id,
        });

        return successResponse(res, null, 'Categoría eliminada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar categoría', 500, error.message);
    }
};
