// src/core/user/user.validation.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.string().min(3),
  typeBP: z.enum(['PERSONA', 'EMPRESA']).optional(),
  isBusiness: z.boolean().optional().default(false),
  documentNumber: z.string().optional(),
  sexo: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

export const updateMeSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  sexo: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  image: z.string().url().optional(),
});

export const createBusinessUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  roleCode: z.string().min(3),
  password: z.string().min(8).optional(),
});

export const updateBusinessUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  roleCode: z.string().min(3).optional(),
});
