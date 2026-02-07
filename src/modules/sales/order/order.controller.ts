import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut,
    requestApiSaleDelete
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { createOrderSchema, updateOrderSchema, orderIdSchema } from './order.validation';

/**
 * Obtener todas las ordenes
 * GET /api/sales/orders
 */
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const orders = await requestApiSaleGet(`orders?${queryParams}`);
        return successResponse(res, orders, 'Ordenes obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener ordenes', 500, error.message);
    }
};

/**
 * Obtener ordenes para select/dropdown
 * GET /api/sales/orders/select
 */
export const getOrdersForSelect = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const orders = await requestApiSaleGet(`orders/select?societyCode=${societyId}`);
        return successResponse(res, orders, 'Ordenes para select obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener ordenes para select', 500, error.message);
    }
};

/**
 * Obtener ordenes creadas por usuarios
 * GET /api/sales/orders/created-by-users
 */
export const getCreatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const orders = await requestApiSaleGet(`orders/created-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos
        const userIds = [...new Set(orders)];

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
            return successResponse(res, users, 'Usuarios que han creado ordenes obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan creado ordenes');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios creadores', 500, error.message);
    }
};

/**
 * Obtener ordenes actualizadas por usuarios
 * GET /api/sales/orders/updated-by-users
 */
export const getUpdatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const orders = await requestApiSaleGet(`orders/updated-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos (updatedBy)
        const userIds = [...new Set(orders)];

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
            return successResponse(res, users, 'Usuarios que han actualizado ordenes obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan actualizado ordenes');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios', 500, error.message);
    }
};

/**
 * Obtener una orden por ID
 * GET /api/sales/orders/:id
 */
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const validation = orderIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const order = await requestApiSaleGet(`orders/${id}`);
        return successResponse(res, order, 'Orden obtenida exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener orden', 500, error.message);
    }
};

/**
 * Crear una nueva orden
 * POST /api/sales/orders
 */
export const createOrder = async (req: Request, res: Response) => {
    try {
        const validation = createOrderSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const orderData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
        };

        if (!orderData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!orderData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const order = await requestApiSalePost('orders', orderData);
        return successResponse(res, order, 'Orden creada exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear orden', 500, error.message);
    }
};

/**
 * Actualizar una orden
 * PUT /api/sales/orders/:id
 */
export const updateOrder = async (req: Request, res: Response) => {
    try {
        const paramValidation = orderIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateOrderSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.id,
        };

        const { id } = paramValidation.data;
        const order = await requestApiSalePut(`orders/${id}`, updateData);
        return successResponse(res, order, 'Orden actualizada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar orden', 500, error.message);
    }
};

/**
 * Eliminar una orden
 * DELETE /api/sales/orders/:id
 */
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const validation = orderIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`orders/${id}`, {
            updatedBy: req.user?.id,
        });

        return successResponse(res, null, 'Orden eliminada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar orden', 500, error.message);
    }
};
