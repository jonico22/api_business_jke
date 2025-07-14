import { z } from "zod";

export const createSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  promotionId: z.string().uuid().optional(),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Fecha de inicio inválida" }),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Fecha de fin inválida" }),
});
