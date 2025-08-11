import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0, { message: "Price must be greater than or equal to 0" }),
  maxUsers: z.number().int().positive(),
  serviceId: z.string().uuid(),
  frequencyId: z.string().uuid(),
  currencyId: z.string().uuid(),
});

export const updatePlanSchema = createPlanSchema.partial();
