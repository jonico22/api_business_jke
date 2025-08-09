import { z } from "zod";

export const statusSchema = z.enum([
  "pending",
  "rejected",
  "verified",
  "paid",
  "approved",
]);

export const createRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  businessName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  status: statusSchema.optional().default("pending"),
  rejectionReason: z.string().optional(),
  planId: z.string(),
});



export const updateRequestSchema = createRequestSchema.partial();