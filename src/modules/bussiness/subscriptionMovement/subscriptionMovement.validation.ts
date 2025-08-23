import { z } from "zod";

export const createSubscriptionMovementSchema = z.object({
  subscriptionId: z.string().uuid(),
  previousEndDate: z.string().datetime().optional(),
  newEndDate: z.string().datetime(),
  movementType: z.enum(["RENEWAL", "CANCELLATION", "UPGRADE", "DOWNGRADE"]),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
});

export const updateSubscriptionMovementSchema = z.object({
  previousEndDate: z.string().datetime().optional(),
  newEndDate: z.string().datetime().optional(),
  movementType: z.enum(["RENEWAL", "CANCELLATION", "UPGRADE", "DOWNGRADE"]).optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
});
