import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export const updateServiceSchema = createServiceSchema.partial();