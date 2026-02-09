import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut,
    requestApiSaleDelete
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { createCurrencySchema, updateCurrencySchema, currencyIdSchema } from './currency.validation';

/**
 * Obtener todas las monedas
 * GET /api/sales/currencies
 */
export const getAllCurrencies = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const currencies = await requestApiSaleGet(`currencies?${queryParams}`);
        return successResponse(res, currencies, 'Monedas obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener monedas', 500, error.message);
    }
};

/**
 * Obtener monedas para select/dropdown
 * GET /api/sales/currencies/select
 */
export const getCurrenciesForSelect = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const currencies = await requestApiSaleGet(`currencies/select?societyCode=${societyId}`);
        return successResponse(res, currencies, 'Monedas para select obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener monedas para select', 500, error.message);
    }
};

/**
 * Obtener monedas creadas por usuarios
 * GET /api/sales/currencies/created-by-users
 */
export const getCreatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const currencies = await requestApiSaleGet(`currencies/created-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos
        const userIds = [...new Set(currencies)];

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
            return successResponse(res, users, 'Usuarios que han creado monedas obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan creado monedas');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios creadores', 500, error.message);
    }
};

/**
 * Obtener monedas actualizadas por usuarios
 * GET /api/sales/currencies/updated-by-users
 */
export const getUpdatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const currencies = await requestApiSaleGet(`currencies/updated-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos (updatedBy)
        const userIds = [...new Set(currencies)];

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
            return successResponse(res, users, 'Usuarios que han actualizado monedas obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan actualizado monedas');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios', 500, error.message);
    }
};

/**
 * Obtener una moneda por ID
 * GET /api/sales/currencies/:id
 */
export const getCurrencyById = async (req: Request, res: Response) => {
    try {
        const validation = currencyIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const currency = await requestApiSaleGet(`currencies/${id}`);
        return successResponse(res, currency, 'Moneda obtenida exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener moneda', 500, error.message);
    }
};

/**
 * Crear una nueva moneda
 * POST /api/sales/currencies
 */
export const createCurrency = async (req: Request, res: Response) => {
    try {
        const validation = createCurrencySchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const currencyData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
        };

        if (!currencyData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!currencyData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const currency = await requestApiSalePost('currencies', currencyData);
        return successResponse(res, currency, 'Moneda creada exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear moneda', 500, error.message);
    }
};

/**
 * Actualizar una moneda
 * PUT /api/sales/currencies/:id
 */
export const updateCurrency = async (req: Request, res: Response) => {
    try {
        const paramValidation = currencyIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateCurrencySchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.id,
        };

        const { id } = paramValidation.data;
        const currency = await requestApiSalePut(`currencies/${id}`, updateData);
        return successResponse(res, currency, 'Moneda actualizada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar moneda', 500, error.message);
    }
};

/**
 * Eliminar una moneda
 * DELETE /api/sales/currencies/:id
 */
export const deleteCurrency = async (req: Request, res: Response) => {
    try {
        const validation = currencyIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`currencies/${id}`, {
            updatedBy: req.user?.id,
        });

        return successResponse(res, null, 'Moneda eliminada exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar moneda', 500, error.message);
    }
};
