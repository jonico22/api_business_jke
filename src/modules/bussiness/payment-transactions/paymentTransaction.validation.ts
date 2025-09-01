import { z } from "zod";
import { ddMMyyyyStringToDate } from "@/utils/convert-date";

export const CreatePaymentTransactionSchema = z.object({
  subscriptionMovementId: z.string().uuid(),
  amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
  paymentDate: ddMMyyyyStringToDate("Fecha de pago inválida"),
  nextPaymentDate: ddMMyyyyStringToDate("Fecha de próximo pago inválida").optional(),
  paymentMethod: z.enum(["CASH", "CREDIT", "DEBIT", "TRANSFER", "PAYPAL", "OTHER"]),
  status: z.enum(["COMPLETED", "PENDING", "FAILED", "REFUNDED", "FREE"]),
  description: z.string().optional(),
  referenceCode: z.string().optional(),
}).refine(
  (data) => {
    // Si nextPaymentDate no existe, la validación pasa.
    // Si existe, debe ser posterior a paymentDate.
    return !data.nextPaymentDate || data.nextPaymentDate > data.paymentDate;
  },
  { message: "La fecha del próximo pago debe ser posterior a la fecha de pago", path: ["nextPaymentDate"] }
);