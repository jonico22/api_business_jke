import { z } from 'zod';

export const createCuponUsadoSchema = z.object({
  userId: z.string(),
  promocionId: z.string(),
  suscripcionId: z.string(),
  fechaUso: z.date(),
});

export type CreateCuponUsadoInput = z.infer<typeof createCuponUsadoSchema>;