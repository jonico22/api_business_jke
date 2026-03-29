import { Request, Response } from 'express';
import { requestApiSaleGet, requestApiSalePut } from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { 
    listInventorySchema, 
    selectInventorySchema,
    inventoryIdSchema,
    updateInventorySchema 
} from './branch-office-products.validation';

/**
 * Obtener inventario por sucursal (Paginado)
 * GET /api/branch-office-products
 */
export const getInventory = async (req: Request, res: Response) => {
    try {
        const validation = listInventorySchema.safeParse(req.query);
        if (!validation.success) {
            return errorResponse(res, 'Parámetros de búsqueda inválidos', 400, validation.error.format());
        }

        const societyId = req.societyId || '1';
        
        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(validation.data as any)
        }).toString();

        const inventory = await requestApiSaleGet(`branch-office-products?${queryParams}`);
        return successResponse(res, inventory, 'Inventario obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener inventario por sucursal', 500, error.message);
    }
};

/**
 * Selector de inventario por sucursal (Ligero - Paginado)
 * GET /api/branch-office-products/select
 */
export const getInventoryForSelect = async (req: Request, res: Response) => {
    try {
        const validation = selectInventorySchema.safeParse(req.query);
        if (!validation.success) {
            return errorResponse(res, 'Parámetros de búsqueda inválidos', 400, validation.error.format());
        }

        const queryParams = new URLSearchParams({
            ...(validation.data as any)
        }).toString();

        const inventory = await requestApiSaleGet(`branch-office-products/select?${queryParams}`);
        return successResponse(res, inventory, 'Selector de inventario obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener selector de inventario', 500, error.message);
    }
};

/**
 * Obtener detalle de un producto en inventario
 * GET /api/branch-office-products/:id
 */
export const getInventoryById = async (req: Request, res: Response) => {
    try {
        const validation = inventoryIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID de inventario inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const inventoryItem = await requestApiSaleGet(`branch-office-products/${id}`);
        return successResponse(res, inventoryItem, 'Detalle de inventario obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener detalle de inventario', 500, error.message);
    }
};

/**
 * Actualizar stock o ubicación de un producto en inventario
 * PUT /api/branch-office-products/:id
 */
export const updateInventory = async (req: Request, res: Response) => {
    try {
        const paramValidation = inventoryIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID de inventario inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateInventorySchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos de actualización inválidos', 400, bodyValidation.error.format());
        }

        const { id } = paramValidation.data;
        const updatedItem = await requestApiSalePut(`branch-office-products/${id}`, bodyValidation.data);
        return successResponse(res, updatedItem, 'Inventario actualizado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar inventario', 500, error.message);
    }
};
