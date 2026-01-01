import { z } from "zod";

export const createCurrencySchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  code: z.string().min(2).max(5),
  symbol: z.string().min(1).max(5),
});

export const updateCurrencySchema = createCurrencySchema.partial();
