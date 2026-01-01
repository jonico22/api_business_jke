import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  isActive: z.boolean().optional().default(true),
  isDeleted: z.boolean().optional().default(false),
  createdBy: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  updatedBy: z.string().optional(),
});

export const categoryIdSchema = z.string().uuid();
