// src/core/role_view_permission/role-view-permission.validation.ts
import { z } from 'zod';

export const roleViewPermissionSchema = z.object({
  roleId: z.string(),
  viewId: z.string(),
  permissionId: z.string(),
});
