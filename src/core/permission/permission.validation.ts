// src/core/permission/permission.validation.ts
import { z } from 'zod';

export const permissionSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});
