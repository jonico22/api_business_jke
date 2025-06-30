// src/core/view/view.validation.ts
import { z } from 'zod';

export const viewSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
});
