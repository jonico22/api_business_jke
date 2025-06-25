// src/core/view/view.validation.ts
import { z } from 'zod';

export const viewSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});
