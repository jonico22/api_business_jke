import { z } from 'zod';

export const permissionSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
});
export const updatePermissionSchema = permissionSchema.partial().extend({
  id: z.string().uuid(),
});