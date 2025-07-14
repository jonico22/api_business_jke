import { Request, Response } from 'express';
import { cuponesUsadosService } from './usedCoupons.service';
import { createCuponUsadoSchema } from './usedCoupons.validation';

export const createCuponUsado = async (req: Request, res: Response) => {
  try {
    const data = createCuponUsadoSchema.parse(req.body);

    const existing = await cuponesUsadosService.findByUserAndPromocion(
      data.userId,
      data.promocionId
    );

    if (existing) {
      return res.status(409).json({ message: 'Este cupón ya ha sido usado por el usuario' });
    }

    const cupon = await cuponesUsadosService.create(data);
    res.status(201).json({ data: cupon });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getCuponesUsados = async (_req: Request, res: Response) => {
  try {
    const data = await cuponesUsadosService.findAll();
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};