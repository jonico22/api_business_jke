import { z } from "zod";


/**
 * Crea un esquema de Zod para validar y transformar una cadena de fecha en formato "DD-MM-YYYY" a un objeto Date.
 * @param invalidMessage El mensaje de error a mostrar si la fecha es inválida.
 * @returns Un esquema de Zod.
 */
export const ddMMyyyyStringToDate = (invalidMessage: string) =>
  z.string().transform((val, ctx) => {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.invalid_date, message: invalidMessage });
      return z.NEVER;
    }

    const [day, month, year] = val.split("-").map(Number);
    // Usamos Date.UTC para evitar problemas con zonas horarias durante la validación.
    const date = new Date(Date.UTC(year, month - 1, day));

    // Verificamos que la fecha no sea inválida (p.ej. 31 de febrero se convierte en marzo)
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      ctx.addIssue({ code: z.ZodIssueCode.invalid_date, message: invalidMessage });
      return z.NEVER;
    }
    return date;
  });