// src/core/user_view/user-view.validation.ts
import { z } from 'zod';

export const userViewSchema = z.object({
  userId: z.string(),
  viewId: z.string(),
  permissionId: z.string(),
});
