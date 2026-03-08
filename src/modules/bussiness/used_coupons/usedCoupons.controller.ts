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

export const getCuponesUsados = async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId;
    if (!societyId) return res.status(401).json({ message: "Contexto de sociedad no encontrado" });

    const result = await cuponesUsadosService.findAll(societyId, req.query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};