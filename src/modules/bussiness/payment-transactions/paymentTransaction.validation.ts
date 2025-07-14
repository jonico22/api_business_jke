import { z } from "zod";

export const CreatePaymentTransactionSchema = z.object({
  subscriptionId: z.string().uuid(),
  amount: z.number().min(0),
  paymentDate: z.coerce.date(),
  nextPaymentDate: z.coerce.date().optional(),
  paymentMethod: z.enum(["CASH", "CREDIT", "DEBIT", "TRANSFER", "PAYPAL", "OTHER"]),
  status: z.enum(["COMPLETED", "PENDING", "FAILED", "REFUNDED", "FREE"]),
  description: z.string().optional(),
  referenceCode: z.string().optional(),
});