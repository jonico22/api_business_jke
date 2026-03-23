import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut,
    requestApiSaleDelete
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { createClientSchema, updateClientSchema, clientIdSchema } from './client.validation';

/**
 * Obtener todos los clientes
 * GET /api/sales/clients
 * Proxies to /bussinesspartners?type=CUSTOMER
 */
export const getAllClients = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            type: 'CUSTOMER',
            ...(req.query as any)
        }).toString();
        console.log(queryParams);

        const clients = await requestApiSaleGet(`bussinesspartners?${queryParams}`);
        return successResponse(res, clients, 'Clientes obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener clientes', 500, error.message);
    }
};

/**
 * Obtener clientes para select/dropdown
 * GET /api/sales/clients/select
 */
export const getClientsForSelect = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const clients = await requestApiSaleGet(`bussinesspartners/select?societyCode=${societyId}&type=CUSTOMER`);
        return successResponse(res, clients, 'Clientes para select obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener clientes para select', 500, error.message);
    }
};

/**
 * Obtener clientes creados por usuarios
 * GET /api/sales/clients/created-by-users
 */
export const getCreatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const clients = await requestApiSaleGet(`bussinesspartners/created-by-users?societyId=${societyId}&type=CUSTOMER`);

        // 2. Extraer IDs de usuarios únicos.
        // La API devuelve un array de IDs (strings).
        const userIds = [...new Set(clients)];

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
            return successResponse(res, users, 'Usuarios que han creado clientes obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan creado clientes');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios creadores', 500, error.message);
    }
};

/**
 * Obtener clientes actualizados por usuarios
 * GET /api/sales/clients/updated-by-users
 */
export const getUpdatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const clients = await requestApiSaleGet(`bussinesspartners/updated-by-users?societyId=${societyId}&type=CUSTOMER`);

        // 2. Extraer IDs de usuarios únicos.
        // La API devuelve un array de IDs (strings), no objetos.
        const userIds = [...new Set(clients)];

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
            return successResponse(res, users, 'Usuarios que han actualizado clientes obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan actualizado clientes');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios', 500, error.message);
    }
};

/**
 * Obtener un cliente por ID
 * GET /api/sales/clients/:id
 */
export const getClientById = async (req: Request, res: Response) => {
    try {
        const validation = clientIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const client = await requestApiSaleGet(`bussinesspartners/${id}`);
        return successResponse(res, client, 'Cliente obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener cliente', 500, error.message);
    }
};

/**
 * Crear un nuevo cliente
 * POST /api/sales/clients
 */
export const createClient = async (req: Request, res: Response) => {
    try {
        const validation = createClientSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const clientData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
            type: 'CUSTOMER' // Fuerza el tipo CUSTOMER
        };

        if (!clientData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!clientData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const client = await requestApiSalePost('bussinesspartners', clientData);
        return successResponse(res, client, 'Cliente creado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear cliente', 500, error.message);
    }
};

/**
 * Actualizar un cliente
 * PUT /api/sales/clients/:id
 */
export const updateClient = async (req: Request, res: Response) => {
    try {
        const paramValidation = clientIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateClientSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.id,
        };

        const { id } = paramValidation.data;
        const client = await requestApiSalePut(`bussinesspartners/${id}`, updateData);
        return successResponse(res, client, 'Cliente actualizado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar cliente', 500, error.message);
    }
};

/**
 * Eliminar un cliente
 * DELETE /api/sales/clients/:id
 */
export const deleteClient = async (req: Request, res: Response) => {
    try {
        const validation = clientIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`bussinesspartners/${id}`, {
            updatedBy: req.user?.id,
        });

        return successResponse(res, null, 'Cliente eliminado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar cliente', 500, error.message);
    }
};
