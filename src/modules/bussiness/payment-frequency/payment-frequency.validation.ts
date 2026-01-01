import { z } from "zod";

export const createPaymentFrequencySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  intervalDays: z.number().min(1, "Debe ser mayor a 0 días"),
});

export const updatePaymentFrequencySchema = createPaymentFrequencySchema.partial();
