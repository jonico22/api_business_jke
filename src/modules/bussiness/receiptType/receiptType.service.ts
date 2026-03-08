import prisma from '@/config/database';
import { createReceiptTypeSchema, updateReceiptTypeSchema } from './receiptType.validation'

export const getAllReceiptTypes = async () => {
  return await prisma.receiptType.findMany()
}

export const getReceiptTypeById = async (id: string) => {
  return await prisma.receiptType.findUnique({ where: { id } })
}

export const createReceiptType = async (data: unknown) => {
  const validated = createReceiptTypeSchema.parse(data)
  return await prisma.receiptType.create({ data: validated as any })
}

export const updateReceiptType = async (id: string, data: unknown) => {
  const validated = updateReceiptTypeSchema.parse(data)
  return await prisma.receiptType.update({ where: { id }, data: validated as any })
}

export const deleteReceiptType = async (id: string) => {
  return await prisma.receiptType.delete({ where: { id } })
}
