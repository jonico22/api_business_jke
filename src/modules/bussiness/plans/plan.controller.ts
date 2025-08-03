import { Request, Response } from "express";
import { planService } from "./plan.service";
import { createPlanSchema, updatePlanSchema } from "./plan.validation";
import { s } from "better-auth/dist/shared/better-auth.BTuiucL9";

/**
 * @swagger
 * /plans:
 *   post:
 *     summary: Crear nuevo plan
 *     tags: [Plan]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: decimal
 *               currencyId:
 *                 type: string
 *               frequencyId:
 *                 type: string
 *               maxUsers:
 *                type: integer
 *               serviceId:
 *                type: string
 *     responses:
 *       201:
 *         description: Plan creado correctamente
 *       400:
 *         description: Error al crear el plan
 */

export const createPlan = async (req: Request, res: Response) => {
  try {
    const data = createPlanSchema.parse(req.body);
    const result = await planService.create(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Obtener todos los planes
 *     tags: [Plan]
 *     responses:
 *       200:
 *         description: Lista de planes obtenidos correctamente
 */

export const getPlans = async (_: Request, res: Response) => {
  const result = await planService.findAll();
  res.json(result);
};

/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     summary: Obtener plan por ID
 *     tags: [Plan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan encontrado correctamente
 *       404:
 *         description: Plan no encontrado
 */


export const getPlanById = async (req: Request, res: Response) => {
  const result = await planService.findById(req.params.id);
  if (!result) return res.status(404).json({ error: "Plan no encontrado" });
  res.json(result);
};

/**
 * @swagger
 * /plans/{id}:
 *   put:
 *     summary: Actualizar plan por ID
 *     tags: [Plan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: decimal
 *               currencyId:
 *                 type: string
 *               frequencyId:
 *                 type: string
 *               maxUsers:
 *                type: integer
 *               serviceId:
 *                type: string
 *     responses:
 *       200:
 *         description: Plan actualizado correctamente
 *      400: 
 *        description: Error al actualizar el plan
*/



export const updatePlan = async (req: Request, res: Response) => {
  try {
    const data = updatePlanSchema.parse(req.body);
    const result = await planService.update(req.params.id, data);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


/**
 * @swagger
 * /plans/{id}:
 *   delete:
 *     summary: Eliminar plan por ID
 *     tags: [Plan]
 *     parameters:
 *       - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      204:
 *       description: Plan eliminado correctamente
 *     404:
 *       description: Plan no encontrado
 * */


export const deletePlan = async (req: Request, res: Response) => {
  try {
    await planService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
