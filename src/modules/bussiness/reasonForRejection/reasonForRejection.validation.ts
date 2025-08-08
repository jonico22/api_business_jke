import { z } from 'zod'

export const createReasonSchema = z.object({
  reason: z.string().min(3, 'Reason is required and must be at least 3 characters long'),
})

export const updateReasonSchema = z.object({
  reason: z.string().min(3, 'Reason is required and must be at least 3 characters long'),
})
