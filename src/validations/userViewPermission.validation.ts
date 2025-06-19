import { z } from 'zod';

export const userViewPermissionSchema = z.object({
  userId: z.string().uuid(),
  viewId: z.string().uuid(),
  permissionId: z.string().uuid(),
});
