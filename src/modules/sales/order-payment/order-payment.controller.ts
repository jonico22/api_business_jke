import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut,
    requestApiSaleDelete
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { createOrderPaymentSchema, updateOrderPaymentSchema, orderPaymentIdSchema } from './order-payment.validation';

/**
 * Obtener todos los pagos de ordenes
 * GET /api/sales/order-payments
 */
export const getAllOrderPayments = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const orderPayments = await requestApiSaleGet(`order-payments?${queryParams}`);
        return successResponse(res, orderPayments, 'Pagos de orden obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener pagos de orden', 500, error.message);
    }
};

/**
 * Obtener pagos por ID de orden (Filtro común)
 * GET /api/sales/order-payments/by-order/:orderId
 */
export const getOrderPaymentsByOrderId = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            orderId: orderId
        }).toString();

        const orderPayments = await requestApiSaleGet(`order-payments?${queryParams}`);
        return successResponse(res, orderPayments, 'Pagos de la orden obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener pagos de la orden', 500, error.message);
    }
}

/**
 * Obtener pagos de orden creados por usuarios
 * GET /api/sales/order-payments/created-by-users
 */
export const getCreatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const orderPayments = await requestApiSaleGet(`order-payments/created-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos
        const userIds = [...new Set(orderPayments)];

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
            return successResponse(res, users, 'Usuarios que han creado pagos obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan creado pagos');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios creadores', 500, error.message);
    }
};

/**
 * Obtener pagos de orden actualizados por usuarios
 * GET /api/sales/order-payments/updated-by-users
 */
export const getUpdatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const orderPayments = await requestApiSaleGet(`order-payments/updated-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos (updatedBy)
        const userIds = [...new Set(orderPayments)];

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
            return successResponse(res, users, 'Usuarios que han actualizado pagos obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan actualizado pagos');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios', 500, error.message);
    }
};

/**
 * Obtener un pago de orden por ID
 * GET /api/sales/order-payments/:id
 */
export const getOrderPaymentById = async (req: Request, res: Response) => {
    try {
        const validation = orderPaymentIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const orderPayment = await requestApiSaleGet(`order-payments/${id}`);
        return successResponse(res, orderPayment, 'Pago de orden obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener pago de orden', 500, error.message);
    }
};

/**
 * Crear un nuevo pago de orden
 * POST /api/sales/order-payments
 */
export const createOrderPayment = async (req: Request, res: Response) => {
    try {
        const validation = createOrderPaymentSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const orderPaymentData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
        };

        if (!orderPaymentData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!orderPaymentData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const orderPayment = await requestApiSalePost('order-payments', orderPaymentData);
        return successResponse(res, orderPayment, 'Pago de orden creado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear pago de orden', 500, error.message);
    }
};

/**
 * Actualizar un pago de orden
 * PUT /api/sales/order-payments/:id
 */
export const updateOrderPayment = async (req: Request, res: Response) => {
    try {
        const paramValidation = orderPaymentIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateOrderPaymentSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.id,
        };

        const { id } = paramValidation.data;
        const orderPayment = await requestApiSalePut(`order-payments/${id}`, updateData);
        return successResponse(res, orderPayment, 'Pago de orden actualizado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar pago de orden', 500, error.message);
    }
};

/**
 * Eliminar un pago de orden
 * DELETE /api/sales/order-payments/:id
 */
export const deleteOrderPayment = async (req: Request, res: Response) => {
    try {
        const validation = orderPaymentIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`order-payments/${id}`, {
            updatedBy: req.user?.id,
        });

        return successResponse(res, null, 'Pago de orden eliminado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar pago de orden', 500, error.message);
    }
};
