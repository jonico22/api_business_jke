import { Request, Response } from "express";
import { requestService } from "./request.service";
import {
  createRequestSchema,
  updateRequestSchema,
} from "./request.validation";

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Crear nueva solicitud
 *     tags: [Request]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               businessName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               planId:
 *                 type: string
 *               status:
 *                 type: string
 *               rejectionid:
 *                 type: string
 *     responses:
 *       201:
 *         description: Solicitud creada correctamente
 *       400:
 *         description: Error al crear la solicitud
 */


export const createRequest = async (req: Request, res: Response) => {
  try {
    const data = createRequestSchema.parse(req.body);
    const result = await requestService.create(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Obtener todas las solicitudes
 *     tags: [Request]
 *     responses:
 *       200:
 *         description: Lista de solicitudes obtenida correctamente
 *       500:
 *         description: Error al obtener las solicitudes
 */

export const getRequests = async (req: Request, res: Response) => {
  try {
    const result = await requestService.findAll();
    res.json({ data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /requests/{id}:
 *   get:
 *     summary: Obtener solicitud por ID
 *     tags: [Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud a obtener
 *     responses:
 *       200:
 *         description: Solicitud obtenida correctamente
 *       404:
 *         description: Solicitud no encontrada
 */

export const getRequestById = async (req: Request, res: Response) => {
  try {
    const result = await requestService.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * @swagger
 * /requests/{id}:
 *   put:
 *     summary: Actualizar solicitud por ID
 *     tags: [Request]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               businessName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               planId:
 *                 type: string
 *               status:
 *                 type: string
 *               rejectionid:
 *                 type: string
 *     responses:
 *       200:
 *         description: Solicitud actualizada correctamente
 *       400:
 *         description: Error al actualizar la solicitud
 */


export const updateRequest = async (req: Request, res: Response) => {
  try {
    const data = updateRequestSchema.parse(req.body);
    const result = await requestService.update(req.params.id, data);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


/**
 * @swagger
 * /requests/{id}:
 *   delete:
 *     summary: Eliminar solicitud por ID
 *     tags: [Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Solicitud eliminada correctamente
 *       400:
 *         description: Error al eliminar la solicitud
 */

export const deleteRequest = async (req: Request, res: Response) => {
  try {
    await requestService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};