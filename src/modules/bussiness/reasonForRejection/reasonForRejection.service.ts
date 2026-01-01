import prisma from '@/config/database';
import { createReasonSchema } from './reasonForRejection.validation'
import z from 'zod';

export const createReason = async (data: z.infer<typeof createReasonSchema>) => {
  return await prisma.reasoneForRejection.create({
    data,
  })
}

export const getAllReasons = async () => {
  return await prisma.reasoneForRejection.findMany()
}

export const getReasonById = async (id: string) => {
  return await prisma.reasoneForRejection.findUnique({
    where: { id },
  })
}

export const updateReason = async (id: string, data: z.infer<typeof createReasonSchema>) => {
  return await prisma.reasoneForRejection.update({
    where: { id },
    data,
  })
}

export const deleteReason = async (id: string) => {
  return await prisma.reasoneForRejection.delete({
    where: { id },
  })
}
