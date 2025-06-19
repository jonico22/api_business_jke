import { z } from 'zod';

export const roleViewPermissionSchema = z.object({
  roleId: z.string().uuid(),
  viewId: z.string().uuid(),
  permissionId: z.string().uuid(),
});
