import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(3),
});
