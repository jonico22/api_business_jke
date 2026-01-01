import { Request, Response } from "express";
import { promotionService } from "./promotion.service";
import { createPromotionSchema } from "./promotion.validation";

/**
* @swagger
* /promotions:
*   post:
*    summary: Crear nueva promoción
*    tags: [Promotion]
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            type: object
*            properties:
*              name:
*               type: string
*              description:
*               type: string
*              discountPercentage:
*               type: number
*              startDate:
*               type: string
*               format: date-time
*              endDate:
*               type: string
*               format: date-time
*              code:
*               type: string
*              durationUnit:
*               type: string
*              durationValue:
*               type: integer
*              maxUses:
*               type: integer
*              currentUsages:
*               type: integer
*              discountType:
*               type: string
*    responses:
*      201:
*        description: Promoción creada correctamente
*      400:
*        description: Error al crear la promoción
*/


export const createPromotion = async (req: Request, res: Response) => {
  try {
    const data = createPromotionSchema.parse(req.body);
    const result = await promotionService.create(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /promotions:
 *   get:
 *     summary: Obtener todas las promociones
 *     tags: [Promotion]
 *     responses:
 *       200:
 *         description: Lista de promociones obtenidas correctamente
 */


export const getPromotions = async (_: Request, res: Response) => {
  const result = await promotionService.findAll();
  res.json(result);
};


/**
 * @swagger
 * /promotions/{id}:
 *   get:
 *     summary: Obtener promoción por ID
 *     tags: [Promotion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promoción encontrada correctamente
 *       404:
 *         description: Promoción no encontrada
 */


export const getPromotionById = async (req: Request, res: Response) => {
  const result = await promotionService.findById(req.params.id);
  if (!result) return res.status(404).json({ error: "Promoción no encontrada" });
  res.json(result);
};

/**
* @swagger
* /promotions/{id}:
*   put:
*    summary: Actualizar promoción por ID
*    tags: [Promotion]
*    parameters:
*      - in: path
*        name: id
*        required: true
*        schema:
*          type: string
*   requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            type: object
*            properties:
*              name:
*                type: string
*              description:
*                type: string
*              discountPercentage:
*                type: number
*              startDate:
*                type: string
*                format: date-time
*              endDate:
*                type: string
*                format: date-time
*              code:
*                type: string
*              durationUnit:
*                type: string
*              durationValue:
*                type: integer
*              maxUses:
*                type: integer
*              currentUsages:
*                type: integer
*              discountType: 
*                type: string
*      responses:
*          200:
*            description: Promoción actualizada correctamente
*          400:
*            description: Error al actualizar la promoción  
* 
*/ 


export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const result = await promotionService.update(req.params.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /promotions/{id}:
 *   delete:
 *     summary: Eliminar una promoción por ID
 *     tags: [Promotion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Promoción eliminada correctamente
 *       404:
 *         description: Promoción no encontrada
 */


export const deletePromotion = async (req: Request, res: Response) => {
  try {
    await promotionService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
