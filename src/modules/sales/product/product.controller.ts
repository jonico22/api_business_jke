import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut,
    requestApiSaleDelete
} from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';
import { 
    createProductSchema, 
    updateProductSchema, 
    productIdSchema,
    productSelectQuerySchema 
} from './product.validation';

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
        const validation = productSelectQuerySchema.safeParse(req.query);
        if (!validation.success) {
            return errorResponse(res, 'Parámetros de consulta inválidos', 400, validation.error.format());
        }

        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString(),
            ...(validation.data as any)
        }).toString();

        const products = await requestApiSaleGet(`products/select?${queryParams}`);
        return successResponse(res, products, 'Productos para select obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener productos para select', 500, error.message);
    }
};

/**
 * Obtener productos creados por usuarios
 * GET /api/sales/products/created-by-users
 */
export const getCreatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const products = await requestApiSaleGet(`products/created-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos
        const userIds = [...new Set(products)];

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
            return successResponse(res, users, 'Usuarios que han creado productos obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan creado productos');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios creadores', 500, error.message);
    }
};

/**
 * Obtener productos actualizados por usuarios
 * GET /api/sales/products/updated-by-users
 */
export const getUpdatedByUsers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        // 1. Obtener datos de la API de ventas
        const products = await requestApiSaleGet(`products/updated-by-users?societyId=${societyId}`);

        // 2. Extraer IDs de usuarios únicos (updatedBy)
        const userIds = [...new Set(products)];

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
            return successResponse(res, users, 'Usuarios que han actualizado productos obtenidos exitosamente');
        }

        return successResponse(res, [], 'No se encontraron usuarios que hayan actualizado productos');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener usuarios', 500, error.message);
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

/**
 * Carga masiva de productos desde CSV
 * POST /api/sales/products/bulk-upload
 */
export const bulkUploadProducts = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No se proporcionó ningún archivo', 400);
        }

        const { validateCSVColumns } = await import('@/utils/csv-parser.util');

        // Convertir buffer a string para validación local
        const csvContent = req.file.buffer.toString('utf-8');

        // Validar columnas requeridas localmente (validación previa)
        // Basado en products_template.csv
        const requiredColumns = ['NombreProducto', 'CodigoInterno', 'CodigoCategoria', 'PrecioVenta', 'PrecioCosto', 'StockInicial', 'StockMinimo'];
        try {
            validateCSVColumns(csvContent, requiredColumns);
        } catch (error: any) {
            return errorResponse(res, 'Estructura CSV inválida', 400, error.message);
        }

        // Preparar FormData para enviar a la API de ventas
        const FormData = (await import('form-data')).default;
        const formData = new FormData();

        // Agregar archivo
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Enviar a la API de ventas (que procesará el CSV internamente)
        // La función requestApiSalePost detectará FormData y usará streaming nativo
        // Pasamos societyId y createdBy como query params o metadata si la API lo requiere, 
        // pero siguiendo el patrón de categories, lo enviamos en la URL para que el backend de sales lo reciba
        const result = await requestApiSalePost(`products/bulk-upload?societyCode=${req.societyId}&createdBy=${req.user?.id}`, formData);

        return successResponse(res, result, 'Carga masiva procesada exitosamente', 201);

    } catch (error: any) {
        return errorResponse(res, 'Error al procesar archivo CSV', 500, error.message);
    }
};

/**
 * Obtener productos más vendidos
 * GET /api/sales/products/best-sellers
 */
export const getBestSellers = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyId: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const products = await requestApiSaleGet(`products/best-sellers?${queryParams}`);
        return successResponse(res, products, 'Productos más vendidos obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener productos más vendidos', 500, error.message);
    }
};

/**
 * Obtener listado de marcas
 * GET /api/sales/products/brands
 */
export const getBrands = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyId: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const brands = await requestApiSaleGet(`products/brands?${queryParams}`);
        return successResponse(res, brands, 'Marcas obtenidas exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener marcas', 500, error.message);
    }
};

/**
 * Obtener listado de colores
 * GET /api/sales/products/colors
 */
export const getColors = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';

        const queryParams = new URLSearchParams({
            societyId: societyId.toString(),
            ...(req.query as any)
        }).toString();

        const colors = await requestApiSaleGet(`products/colors?${queryParams}`);
        return successResponse(res, colors, 'Colores obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener colores', 500, error.message);
    }
};
