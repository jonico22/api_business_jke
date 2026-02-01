import { Request, Response } from 'express';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut,
    requestApiSaleDelete
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { createProductSchema, updateProductSchema, productIdSchema } from './product.validation';

/**
 * Obtener todos los productos
 * GET /api/sales/products
 */
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const products = await requestApiSaleGet(`products?${queryParams}`);
        return successResponse(res, products, 'Productos obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener productos', 500, error.message);
    }
};

/**
 * Obtener productos para select/dropdown
 * GET /api/sales/products/select
 */
export const getProductsForSelect = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const products = await requestApiSaleGet(`products/select?societyCode=${societyId}`);
        return successResponse(res, products, 'Productos para select obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener productos para select', 500, error.message);
    }
};

/**
 * Obtener un producto por ID
 * GET /api/sales/products/:id
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const validation = productIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const product = await requestApiSaleGet(`products/${id}`);
        return successResponse(res, product, 'Producto obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener producto', 500, error.message);
    }
};

/**
 * Crear un nuevo producto
 * POST /api/sales/products
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const validation = createProductSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const productData = {
            ...validation.data,
            societyId: req.societyId,
            createdBy: req.user?.id,
        };

        if (!productData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!productData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const product = await requestApiSalePost('products', productData);
        return successResponse(res, product, 'Producto creado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear producto', 500, error.message);
    }
};

/**
 * Actualizar un producto
 * PUT /api/sales/products/:id
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const paramValidation = productIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateProductSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: req.user?.id,
        };

        const { id } = paramValidation.data;
        const product = await requestApiSalePut(`products/${id}`, updateData);
        return successResponse(res, product, 'Producto actualizado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar producto', 500, error.message);
    }
};

/**
 * Eliminar un producto
 * DELETE /api/sales/products/:id
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const validation = productIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`products/${id}`, {
            updatedBy: req.user?.id,
        });

        return successResponse(res, null, 'Producto eliminado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar producto', 500, error.message);
    }
};
