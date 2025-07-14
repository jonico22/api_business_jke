import { Request, Response } from "express";
import { subscriptionService } from "./subscription.service";
import { createSubscriptionSchema } from "./subscription.validation";

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const data = createSubscriptionSchema.parse(req.body);
    const subscription = await subscriptionService.create(data);
    res.status(201).json(subscription);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getSubscriptions = async (_req: Request, res: Response) => {
  try {
    const subscriptions = await subscriptionService.findAll();
    res.json({ data: subscriptions });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubscriptionById = async (req: Request, res: Response) => {
  try {
    const subscription = await subscriptionService.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: "Suscripción no encontrada" });
    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const data = createSubscriptionSchema.parse(req.body);
    const subscription = await subscriptionService.update(req.params.id, data);
    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    await subscriptionService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
