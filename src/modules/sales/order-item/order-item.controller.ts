import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut,
    requestApiSaleDelete
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { createOrderItemSchema, updateOrderItemSchema, orderItemIdSchema } from './order-item.validation';

/**
 * Obtener todos los items de ordenes
 * GET /api/sales/order-items
 */
export const getAllOrderItems = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const orderItems = await requestApiSaleGet(`order-items?${queryParams}`);
        return successResponse(res, orderItems, 'Items de orden obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener items de orden', 500, error.message);
    }
};

/**
 * Obtener items de orden para select/dropdown (opcional, si aplica)
 * GET /api/sales/order-items/select
 */
export const getOrderItemsForSelect = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const orderItems = await requestApiSaleGet(`order-items/select?societyCode=${societyId}`);
        return successResponse(res, orderItems, 'Items de orden para select obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener items de orden para select', 500, error.message);
    }
};

/**
 * Obtener items de orden creados por usuarios
 * GET /api/sales/order-items/created-by-users
 */
export const getCreatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const orderItems = await requestApiSaleGet(`order-items/created-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos
        const userIds = [...new Set(orderItems)];

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
            return successResponse(res, users, 'Usuarios que han creado items de orden obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan creado items de orden');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios creadores', 500, error.message);
    }
};

/**
 * Obtener items de orden actualizados por usuarios
 * GET /api/sales/order-items/updated-by-users
 */
export const getUpdatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const orderItems = await requestApiSaleGet(`order-items/updated-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos (updatedBy)
        const userIds = [...new Set(orderItems)];

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
            return successResponse(res, users, 'Usuarios que han actualizado items de orden obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan actualizado items de orden');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios', 500, error.message);
    }
};

/**
 * Obtener un item de orden por ID
 * GET /api/sales/order-items/:id
 */
export const getOrderItemById = async (req: Request, res: Response) => {
    try {
        const validation = orderItemIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const orderItem = await requestApiSaleGet(`order-items/${id}`);
        return successResponse(res, orderItem, 'Item de orden obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener item de orden', 500, error.message);
    }
};

/**
 * Crear un nuevo item de orden
 * POST /api/sales/order-items
 */
export const createOrderItem = async (req: Request, res: Response) => {
    try {
        const validation = createOrderItemSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const orderItemData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
        };

        if (!orderItemData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!orderItemData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const orderItem = await requestApiSalePost('order-items', orderItemData);
        return successResponse(res, orderItem, 'Item de orden creado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear item de orden', 500, error.message);
    }
};

/**
 * Actualizar un item de orden
 * PUT /api/sales/order-items/:id
 */
export const updateOrderItem = async (req: Request, res: Response) => {
    try {
        const paramValidation = orderItemIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateOrderItemSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.id,
        };

        const { id } = paramValidation.data;
        const orderItem = await requestApiSalePut(`order-items/${id}`, updateData);
        return successResponse(res, orderItem, 'Item de orden actualizado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar item de orden', 500, error.message);
    }
};

/**
 * Eliminar un item de orden
 * DELETE /api/sales/order-items/:id
 */
export const deleteOrderItem = async (req: Request, res: Response) => {
    try {
        const validation = orderItemIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`order-items/${id}`, {
            updatedBy: req.user?.id,
        });

        return successResponse(res, null, 'Item de orden eliminado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar item de orden', 500, error.message);
    }
};
