// src/core/user/user.validation.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string(),
  address: z.string().optional(),
  role: z.string().min(3),
  typeBP: z.enum(['natural', 'empresa']).optional(),
  isBusiness: z.boolean().optional().default(false),
  documentNumber: z.string().optional(),
  sexo: z.string().optional(),
});

export const updateMeSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  sexo: z.string().optional(),
});
