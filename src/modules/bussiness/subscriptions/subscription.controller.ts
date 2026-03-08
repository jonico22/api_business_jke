import { Request, Response } from "express";
import { subscriptionService } from "./subscription.service";
import { createSubscriptionSchema } from "./subscription.validation";
import { uploadFileToR2 } from '@/shared/services/upload.service';
import { fileService } from '@/modules/bussiness/files/file.service';
import { v4 as uuidv4 } from 'uuid';


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

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId;
    if (!societyId) return res.status(401).json({ message: "Contexto de sociedad no encontrado" });

    const subscriptions = await subscriptionService.findAll(societyId, req.query);
    res.json(subscriptions);
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

/**
 * @swagger
 * /subscriptions/{id}/renew:
 *   post:
 *     summary: Renovar una suscripción por ID
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               paymentMethod:
 *                 type: string
 *               referenceCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Suscripción renovada correctamente (o en estado pendiente de aprobación)
 *       400:
 *         description: Error al renovar
 */
export const renewSubscription = async (req: Request, res: Response) => {
  try {
    const { paymentMethod, referenceCode } = req.body;
    let fileId: string | undefined;

    // Si viene un archivo desde el front-end con clave "file"
    if (req.file) {
      const uniqueName = `voucher-${Date.now()}-${uuidv4()}-${req.file.originalname}`;
      const folder = "vouchers";
      const key = `${folder}/${uniqueName}`;

      const fileUrl = `${process.env.R2_PUBLIC_URL}/${process.env.R2_BUCKET}/${key}`;

      // 1. Subir al Storage (vía R2)
      await uploadFileToR2(req.file, key);

      // 2. Registrar en la base de datos de Files
      const fileRecord = await fileService({
        name: req.file.originalname,
        path: fileUrl,
        mimeType: req.file.mimetype,
        size: req.file.size,
        key: key
      });

      fileId = fileRecord.id;
    }

    const options = {
      fileId,
      paymentMethod,
      referenceCode
    };

    const result = await subscriptionService.renew(req.params.id, options);
    res.json(result);
  } catch (error: any) {
    console.error("Error renovando:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /subscriptions/{id}/upgrade:
 *   post:
 *     summary: Cambiar de plan (Upgrade/Downgrade)
 *     tags: [Subscription]
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
 *               newPlanId:
 *                 type: string
 *                 description: ID del nuevo plan
 *     responses:
 *       200:
 *         description: Plan cambiado correctamente
 *       400:
 *         description: Error al cambiar de plan
 */
export const upgradeSubscription = async (req: Request, res: Response) => {
  try {
    const { newPlanId } = req.body;
    if (!newPlanId) return res.status(400).json({ message: "Se requiere newPlanId" });
    const result = await subscriptionService.upgrade(req.params.id, newPlanId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /subscriptions/{id}/cancel:
 *   post:
 *     summary: Cancelar una suscripción por ID
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Razón o notas de la cancelación
 *     responses:
 *       200:
 *         description: Suscripción cancelada correctamente
 *       400:
 *         description: Error al cancelar
 */
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    const result = await subscriptionService.cancel(req.params.id, notes);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /subscriptions/{id}/reactivate:
 *   post:
 *     summary: Reactivar una suscripción cancelada
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Suscripción reactivada correctamente
 *       400:
 *         description: Error al reactivar
 */
export const reactivateSubscription = async (req: Request, res: Response) => {
  try {
    const result = await subscriptionService.reactivate(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /subscriptions/{id}/auto-renew:
 *   patch:
 *     summary: Activar o desactivar la renovación automática
 *     tags: [Subscription]
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
 *               autoRenew:
 *                 type: boolean
 *                 description: Estado de la renovación automática
 *     responses:
 *       200:
 *         description: Renovación automática actualizada
 *       400:
 *         description: Error al actualizar
 */
export const toggleAutoRenewSubscription = async (req: Request, res: Response) => {
  try {
    const { autoRenew } = req.body;
    if (typeof autoRenew !== 'boolean') {
      return res.status(400).json({ message: "Se requiere un valor booleano para autoRenew" });
    }
    const result = await subscriptionService.toggleAutoRenew(req.params.id, autoRenew);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @swagger
 * /subscriptions/{id}/history:
 *   get:
 *     summary: Obtener el historial de movimientos de la suscripción
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial obtenido
 */
export const getHistory = async (req: Request, res: Response) => {
  try {
    const history = await subscriptionService.getHistory(req.params.id);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /subscriptions/{id}/billing:
 *   get:
 *     summary: Obtener el historial de facturación de la suscripción
 *     tags: [Subscription]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Facturación obtenida
 */
export const getBilling = async (req: Request, res: Response) => {
  try {
    const billing = await subscriptionService.getBilling(req.params.id);
    res.json(billing);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
