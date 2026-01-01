import { z } from "zod";
import { ddMMyyyyStringToDate } from "@/utils/convert-date";

export const createSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  requestId: z.string().uuid(),
  startDate: ddMMyyyyStringToDate("Fecha de inicio inválida"),
  endDate: ddMMyyyyStringToDate("Fecha de fin inválida"),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE", "EXPIRED"]).default("PENDING"),
}).refine((data) => data.endDate > data.startDate, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["endDate"], // Asigna el error al campo 'endDate'
});
