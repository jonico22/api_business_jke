import { Request, Response } from "express";
import { subscriptionMovementService } from "./subscriptionMovement.service";
import { createSubscriptionMovementSchema, updateSubscriptionMovementSchema } from "./subscriptionMovement.validation";

export const subscriptionMovementController = {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createSubscriptionMovementSchema.parse(req.body);
      const movement = await subscriptionMovementService.create(validatedData);
      res.status(201).json(movement);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const movements = await subscriptionMovementService.getAll();
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const movement = await subscriptionMovementService.getById(id);
      if (!movement) return res.status(404).json({ error: "Movement not found" });
      res.json(movement);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateSubscriptionMovementSchema.parse(req.body);
      const movement = await subscriptionMovementService.update(id, validatedData);
      res.json(movement);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await subscriptionMovementService.delete(id);
      res.json({ message: "Movement deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};
