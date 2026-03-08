import { z } from "zod";
import { ddMMyyyyStringToDate } from "@/utils/convert-date";

export const createSubscriptionMovementSchema = z.object({
  subscriptionId: z.string().uuid(),
  movementDate: ddMMyyyyStringToDate("Fecha de inicio inválida"),
  previousEndDate: ddMMyyyyStringToDate("Fecha de previus inválida").optional(),
  newEndDate: ddMMyyyyStringToDate("Fecha de fin inválida"),
  movementType: z.enum(["RENEWAL", "CANCELLATION", "UPGRADE", "SUBSCRIBED"]),
  newPlanId: z.string().uuid().optional(),
  previousPlanId: z.string().uuid().optional(),
  paymentTransactionId: z.string().uuid().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
});

export const updateSubscriptionMovementSchema = z.object({
  previousEndDate: ddMMyyyyStringToDate("Fecha de previus inválida").optional(),
  newEndDate: ddMMyyyyStringToDate("Fecha fin inválida").optional(),
  movementType: z.enum(["RENEWAL", "CANCELLATION", "UPGRADE", "SUBSCRIBED"]).optional(),
  newPlanId: z.string().uuid().optional(),
  previousPlanId: z.string().uuid().optional(),
  notes: z.string().optional(),
  paymentTransactionId: z.string().uuid().optional(),
  createdBy: z.string().optional(),
});
