import { z } from "zod";

export const receiptSchema = z.object({
  paymentTransactionId: z.string(),
  currencyId: z.string(),
  taxId: z.string(),
  receiptTypeId: z.string(),
  fileId: z.string().optional(),
  businessPartnerId: z.string().optional(),
  number: z.string().min(1),
  date: z.string().datetime(),
  taxAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  status: z.enum(["issued", "cancelled", "pending"]),
});

export const updateReceiptSchema = receiptSchema.partial();
