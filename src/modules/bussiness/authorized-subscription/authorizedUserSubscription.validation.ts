import { z } from 'zod';

export const createAuthorizedUserSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
});

export type CreateAuthorizedUserSubscriptionDTO = z.infer<typeof createAuthorizedUserSubscriptionSchema>;

