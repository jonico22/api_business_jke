import { Request, Response } from 'express';
import { serviceService } from './service.service';
import { createServiceSchema, updateServiceSchema } from './service.validation';

export const createService = async (req: Request, res: Response) => {
  try {
    const data = createServiceSchema.parse(req.body);
    const result = await serviceService.create(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getServices = async (_: Request, res: Response) => {
  const result = await serviceService.findAll();
  res.json(result);
};

export const getServiceById = async (req: Request, res: Response) => {
  const result = await serviceService.findById(req.params.id);
  if (!result) return res.status(404).json({ error: 'Servicio no encontrado' });
  res.json(result);
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const data = updateServiceSchema.parse(req.body);
    const result = await serviceService.update(req.params.id, data);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    await serviceService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
