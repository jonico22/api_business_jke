import { Request, Response } from "express";
import { TariffService } from "./tariff.service";
import { createTariffSchema, updateTariffSchema } from "./tariff.validation";

const service = new TariffService();

export class TariffController {
  async create(req: Request, res: Response) {
    try {
      const validated = createTariffSchema.parse(req.body);
      const tariff = await service.create(validated);
      res.status(201).json(tariff);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const filters = {
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
        planId: req.query.planId as string,
        promotionId: req.query.promotionId as string
      };
      const tariffs = await service.findAll(filters);
      res.json(tariffs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const tariff = await service.findById(req.params.id);
      if (!tariff) return res.status(404).json({ message: "Tariff not found" });
      res.json(tariff);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const validated = updateTariffSchema.parse(req.body);
      const tariff = await service.update(req.params.id, validated);
      res.json(tariff);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const tariff = await service.delete(req.params.id);
      res.json(tariff);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
