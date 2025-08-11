import { z } from 'zod'

export const createReceiptTypeSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  isElectronic: z.boolean().default(true),
  isActive: z.boolean().default(true),
})

export const updateReceiptTypeSchema = createReceiptTypeSchema.partial()
