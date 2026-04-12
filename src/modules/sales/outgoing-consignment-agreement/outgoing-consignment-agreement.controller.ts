import { Request, Response } from 'express';
import {
    requestApiSaleDelete,
    requestApiSaleGet,
    requestApiSalePost,
    requestApiSalePut
} from '@/services/api-sales.service';
import { errorResponse, successResponse } from '@/utils/response';
import {
    createOutgoingConsignmentAgreementSchema,
    listOutgoingConsignmentAgreementsSchema,
    outgoingConsignmentAgreementIdSchema,
    updateOutgoingConsignmentAgreementSchema
} from './outgoing-consignment-agreement.validation';

const RESOURCE_PATH = 'outgoing-consignment-agreements';

/**
 * Obtener todos los acuerdos de consignación saliente
 * GET /api/sales/outgoing-consignment-agreements
 */
export const getOutgoingConsignmentAgreements = async (req: Request, res: Response) => {
    try {
        const validation = listOutgoingConsignmentAgreementsSchema.safeParse(req.query);
        if (!validation.success) {
            return errorResponse(res, 'Parámetros de búsqueda inválidos', 400, validation.error.format());
        }

        const societyCode = req.societyId || '1';
        const queryParams = new URLSearchParams({
            societyCode: societyCode.toString(),
            ...(validation.data as Record<string, string>)
        }).toString();

        const agreements = await requestApiSaleGet(`${RESOURCE_PATH}?${queryParams}`);
        return successResponse(res, agreements, 'Acuerdos de consignación saliente obtenidos exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener acuerdos de consignación saliente', 500, error.message);
    }
};

/**
 * Obtener un acuerdo de consignación saliente por ID
 * GET /api/sales/outgoing-consignment-agreements/:id
 */
export const getOutgoingConsignmentAgreementById = async (req: Request, res: Response) => {
    try {
        const validation = outgoingConsignmentAgreementIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;
        const agreement = await requestApiSaleGet(`${RESOURCE_PATH}/${id}`);
        return successResponse(res, agreement, 'Acuerdo de consignación saliente obtenido exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al obtener acuerdo de consignación saliente', 500, error.message);
    }
};

/**
 * Crear un acuerdo de consignación saliente
 * POST /api/sales/outgoing-consignment-agreements
 */
export const createOutgoingConsignmentAgreement = async (req: Request, res: Response) => {
    try {
        const validation = createOutgoingConsignmentAgreementSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, 'Datos inválidos', 400, validation.error.format());
        }

        const agreementData = {
            ...validation.data,
            societyId: validation.data.societyId || req.societyId,
            createdBy: validation.data.createdBy || req.user?.email || req.user?.id,
        };

        if (!agreementData.societyId) {
            return errorResponse(res, 'No se pudo determinar la sociedad del usuario', 400);
        }
        if (!agreementData.createdBy) {
            return errorResponse(res, 'No se pudo determinar el usuario creador', 400);
        }

        const agreement = await requestApiSalePost(RESOURCE_PATH, agreementData);
        return successResponse(res, agreement, 'Acuerdo de consignación saliente creado exitosamente', 201);
    } catch (error: any) {
        return errorResponse(res, 'Error al crear acuerdo de consignación saliente', 500, error.message);
    }
};

/**
 * Actualizar un acuerdo de consignación saliente
 * PUT /api/sales/outgoing-consignment-agreements/:id
 */
export const updateOutgoingConsignmentAgreement = async (req: Request, res: Response) => {
    try {
        const paramValidation = outgoingConsignmentAgreementIdSchema.safeParse(req.params);
        if (!paramValidation.success) {
            return errorResponse(res, 'ID inválido', 400, paramValidation.error.format());
        }

        const bodyValidation = updateOutgoingConsignmentAgreementSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return errorResponse(res, 'Datos inválidos', 400, bodyValidation.error.format());
        }

        const updateData = {
            ...bodyValidation.data,
            updatedBy: bodyValidation.data.updatedBy || req.user?.email || req.user?.id,
        };

        const { id } = paramValidation.data;
        const agreement = await requestApiSalePut(`${RESOURCE_PATH}/${id}`, updateData);
        return successResponse(res, agreement, 'Acuerdo de consignación saliente actualizado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al actualizar acuerdo de consignación saliente', 500, error.message);
    }
};

/**
 * Eliminar un acuerdo de consignación saliente
 * DELETE /api/sales/outgoing-consignment-agreements/:id
 */
export const deleteOutgoingConsignmentAgreement = async (req: Request, res: Response) => {
    try {
        const validation = outgoingConsignmentAgreementIdSchema.safeParse(req.params);
        if (!validation.success) {
            return errorResponse(res, 'ID inválido', 400, validation.error.format());
        }

        const { id } = validation.data;

        await requestApiSaleDelete(`${RESOURCE_PATH}/${id}`, {
            updatedBy: req.user?.email || req.user?.id,
        });

        return successResponse(res, null, 'Acuerdo de consignación saliente eliminado exitosamente');
    } catch (error: any) {
        return errorResponse(res, 'Error al eliminar acuerdo de consignación saliente', 500, error.message);
    }
};
