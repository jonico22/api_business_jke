import { Request, Response } from 'express';
import { requestApiSaleGet, requestApiSalePost } from '@/services/api-sales.service';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * Listar productos favoritos del usuario
 * GET /api/sales/favorites
 */
export const getFavorites = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const userId = req.user?.id;

        if (!userId) {
            return errorResponse(res, 'Usuario no autenticado', 401);
        }

        const queryParams = new URLSearchParams({
            societyCode: societyId.toString()
        }).toString();

        const favorites = await requestApiSaleGet(`favorites?${queryParams}`, {
            headers: {
                'x-user-id': userId
            }
        });

        return successResponse(res, favorites, 'Favoritos obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener favoritos', 500, error.message);
    }
};

/**
 * Alternar favorito (Toggle)
 * POST /api/sales/favorites/toggle
 */
export const toggleFavorite = async (req: Request, res: Response) => {
    try {
        const societyId = req.societyId || '1';
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!userId) {
            return errorResponse(res, 'Usuario no autenticado', 401);
        }

        if (!productId) {
            return errorResponse(res, 'ID del producto es requerido', 400);
        }

        const result = await requestApiSalePost('favorites/toggle', {
            productId,
            societyId: societyId.toString()
        }, {
            headers: {
                'x-user-id': userId
            }
        });

        return successResponse(res, result, 'Estado de favorito actualizado correctamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al alternar favorito', 500, error.message);
    }
};
