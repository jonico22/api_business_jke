import { z } from "zod";

export const statusSchema = z.enum([
  "pending",
  "rejected",
  "verified",
  "paid",
  "approved",
]);

export const createRequestSchema = z.object({
  code: z.string().min(1).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  businessName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  status: statusSchema.optional().default("pending"),
  rejectionReason: z.string().optional(),
  tariff: z.string(),
  isBusiness: z.boolean().optional().default(false),
  documentNumber: z.string().optional(),
});



export const updateRequestSchema = createRequestSchema.partial();