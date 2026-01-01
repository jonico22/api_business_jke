import { z } from "zod";

export const createPromotionSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(3),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  durationUnit: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]),
  durationValue: z.number().int().positive(),
  isSingleUse: z.boolean(),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Fecha inválida" }),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Fecha inválida" }),
  maxUsages: z.number().int().positive(),
});