import { Request, Response } from "express";
import { paymentFrequencyService } from "./payment-frequency.service";
import {
  createPaymentFrequencySchema,
  updatePaymentFrequencySchema,
} from "./payment-frequency.validation";



/**
 * @swagger
 * /payment-frequencies:
 *   post:
 *     summary: Crear nueva frecuencia de pago
 *     tags: [payment-frequencies]
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
 *               intervalDays:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Frecuencia de pago creada correctamente
 *       400:
 *         description: Error al crear la frecuencia de pago
 */




export const createPaymentFrequency = async (req: Request, res: Response) => {
  try {
    const data = createPaymentFrequencySchema.parse(req.body);
    const result = await paymentFrequencyService.create(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /payment-frequencies:
 *   get:
 *     summary: Obtener todas las frecuencias de pago
 *     tags: [payment-frequencies]
 *     responses:
 *       200:
 *         description: Lista de frecuencias de pago obtenidas correctamente
 * 
 */



export const getPaymentFrequencies = async (_: Request, res: Response) => {
  const result = await paymentFrequencyService.findAll();
  res.json(result);
};




/**
 * @swagger
 * /payment-frequencies/{id}:
 *   get:
 *     summary: Obtener frecuencia de pago por ID
 *     tags: [payment-frequencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Frecuencia de pago obtenida correctamente
 *       404:
 *         description: Frecuencia de pago no encontrada
 */

export const getPaymentFrequencyById = async (req: Request, res: Response) => {
  const result = await paymentFrequencyService.findById(req.params.id);
  if (!result) return res.status(404).json({ error: "No encontrado" });
  res.json(result);
};


/**
 * @swagger
 * /payment-frequencies/{id}:
 *   put:
 *     summary: Actualizar frecuencia de pago por ID
 *     tags: [payment-frequencies]
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
 *               intervalDays:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Frecuencia de pago actualizada correctamente
 *       400:
 *         description: Error al actualizar la frecuencia de pago
 */



export const updatePaymentFrequency = async (req: Request, res: Response) => {
  try {
    const data = updatePaymentFrequencySchema.parse(req.body);
    const result = await paymentFrequencyService.update(req.params.id, data);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


/**
 * @swagger
 * /payment-frequencies/{id}:
 *   delete:
 *     summary: Eliminar una frecuencia de pago por ID
 *     tags: [payment-frequencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Frecuencia de pago eliminada correctamente
 *       400:
 *         description: Frecuencia de pago no encontrada o error al eliminar
 */


export const deletePaymentFrequency = async (req: Request, res: Response) => {
  try {
    await paymentFrequencyService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
