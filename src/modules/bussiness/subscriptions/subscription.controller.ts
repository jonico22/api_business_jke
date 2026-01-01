import { Request, Response } from "express";
import { subscriptionService } from "./subscription.service";
import { createSubscriptionSchema } from "./subscription.validation";


/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Crear nueva suscripción
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               planId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               promotionId:
 *                 type: string
 *               societyId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Suscripción creada correctamente
 *       400:
 *         description: Error al crear la suscripción
 */


export const createSubscription = async (req: Request, res: Response) => {
  try {
    const data = createSubscriptionSchema.parse(req.body);
    const subscription = await subscriptionService.create(data);
    res.status(201).json(subscription);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /subscriptions:
 *   get:
 *     summary: Obtener todas las suscripciones
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: Lista de suscripciones
 *       500:
 *         description: Error al obtener las suscripciones
 */

export const getSubscriptions = async (_req: Request, res: Response) => {
  try {
    const subscriptions = await subscriptionService.findAll();
    res.json({ data: subscriptions });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};





/**
 * @swagger
 * /subscriptions/{id}:
 *   get:
 *     summary: Obtener una suscripción por ID
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción
 *     responses:
 *       200:
 *         description: Suscripción encontrada
 *       404:
 *         description: Suscripción no encontrada
 */


export const getSubscriptionById = async (req: Request, res: Response) => {
  try {
    const subscription = await subscriptionService.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: "Suscripción no encontrada" });
    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};





/**
 * @swagger
 * /subscriptions/{id}:
 *   put:
 *     summary: Actualizar una suscripción por ID
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               planId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               promotionId:
 *                 type: string
 *               societyId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Suscripción encontrada
 *       404:
 *         description: Suscripción no encontrada
 */

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const data = createSubscriptionSchema.parse(req.body);
    const subscription = await subscriptionService.update(req.params.id, data);
    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};







/**
 * @swagger
 * /subscriptions/{id}:
 *   delete:
 *     summary: Eliminar una suscripción por ID
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la suscripción a eliminar
 *     responses:
 *       204:
 *         description: Suscripción eliminada correctamente
 *       404:
 *         description: Suscripción no encontrada
 */

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    await subscriptionService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
