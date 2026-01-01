import { z } from "zod";

export const receiptSchema = z.object({
  transactionId: z.string().uuid(),
  currencyId: z.string().uuid(),
  taxId: z.string().uuid(),
  receiptTypeId: z.string().uuid(),
  fileId: z.string().uuid().optional(),
  series: z.string().min(1),
  number: z.string().min(1),
  taxAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  status: z.enum(["issued", "cancelled", "pending_send"]),
});

export const updateReceiptSchema = receiptSchema.partial();
