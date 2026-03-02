import prisma from '@/config/database';
import { createTaxSchema, updateTaxSchema } from './tax.validation'
import { z } from 'zod';

export const getAllTaxes = async () => {
  return await prisma.tax.findMany()
}

export const getTaxById = async (id: string) => {
  return await prisma.tax.findUnique({ where: { id } })
}

export const createTax = async (data: z.infer<typeof createTaxSchema>) => {
  const validated = createTaxSchema.parse(data);
  return await prisma.tax.create({ data: validated as any })
}

export const updateTax = async (id: string, data: z.infer<typeof updateTaxSchema>) => {
  const validated = updateTaxSchema.parse(data);
  return await prisma.tax.update({ where: { id }, data: validated as any })
}

export const deleteTax = async (id: string) => {
  return await prisma.tax.delete({ where: { id } })
}
