import { z } from 'zod'

export const createTaxSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  value: z.number().positive(), // porcentaje o valor fijo
  type: z.enum(['percentage', 'fixed']),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const updateTaxSchema = createTaxSchema.partial()
