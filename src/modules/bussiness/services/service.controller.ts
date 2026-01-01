import { Request, Response } from 'express';
import { serviceService } from './service.service';
import { createServiceSchema, updateServiceSchema } from './service.validation';


/**
 * @swagger
 * /services:
 *   post:
 *     summary: Crear nuevo servicio
 *     tags: [Service]
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
 *     responses:
 *       201:
 *         description: Servicio creado correctamente
 *       400:
 *         description: Error al crear el servicio
 */



export const createService = async (req: Request, res: Response) => {
  try {
    const data = createServiceSchema.parse(req.body);
    const result = await serviceService.create(data);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Obtener todos los servicios
 *     tags: [Service]
 *     responses:
 *       200:
 *         description: Lista de servicios obtenidos correctamente
 */


export const getServices = async (_: Request, res: Response) => {
  const result = await serviceService.findAll();
  res.json(result);
};


/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Obtener un servicio por ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Servicio obtenido correctamente
 *       404:
 *         description: Servicio no encontrado
 */


export const getServiceById = async (req: Request, res: Response) => {
  const result = await serviceService.findById(req.params.id);
  if (!result) return res.status(404).json({ error: 'Servicio no encontrado' });
  res.json(result);
};


/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Actualizar un servicio por ID
 *     tags: [Service]
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
 *     responses:
 *       200:
 *         description: Servicio actualizado correctamente
 *       400:
 *         description: Error al actualizar el servicio
 */



export const updateService = async (req: Request, res: Response) => {
  try {
    const data = updateServiceSchema.parse(req.body);
    const result = await serviceService.update(req.params.id, data);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};



/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Eliminar un servicio por ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Servicio eliminado correctamente
 *       404:
 *         description: Servicio no encontrado
 */


export const deleteService = async (req: Request, res: Response) => {
  try {
    await serviceService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
};
