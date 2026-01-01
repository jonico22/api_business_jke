import { Request, Response } from 'express';
import { authorizedUserSubscriptionService } from './authorizedUserSubscription.service';
import { createAuthorizedUserSubscriptionSchema } from './authorizedUserSubscription.validation';

export const addAuthorizedUser = async (req: Request, res: Response) => {
  try {
    const data = createAuthorizedUserSubscriptionSchema.parse(req.body);
    const newEntry = await authorizedUserSubscriptionService.add(data);
    res.status(201).json({ data: newEntry });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAuthorizedUsers = async (req: Request, res: Response) => {
  try {
    const list = await authorizedUserSubscriptionService.findAll();
    res.json({ data: list });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeAuthorizedUser = async (req: Request, res: Response) => {
  try {
    await authorizedUserSubscriptionService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};