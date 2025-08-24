import { z } from "zod";

export const createTariffSchema = z.object({
  planId: z.string().uuid(),
  promotionId: z.string().uuid().optional(),
  totalCost: z.number().positive(),
  description: z.string().optional(),
  isActive: z.boolean().optional()
});

export const updateTariffSchema = createTariffSchema.partial();
