// src/core/role/role.validation.ts
import { z } from 'zod';

export const createRoleSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
});
