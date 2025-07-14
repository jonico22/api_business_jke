import { prisma } from '@/config/database';
import { createPaymentTransactionSchema } from './paymentTransaction.validation';

export const paymentTransactionService = {
  create: async (data: CreatePaymentTransactionInput) => {
    return prisma.paymentTransaction.create({ data });
  },
  findAll: async () => {
    return prisma.paymentTransaction.findMany({
      include: {
        subscription: {
          include: {
            user: true,
            plan: true
          }
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  },
  findById: async (id: string) => {
    return prisma.paymentTransaction.findUnique({
      where: { id },
      include: {
        subscription: true
      }
    });
  },
  remove: async (id: string) => {
    return prisma.paymentTransaction.delete({ where: { id } });
  },
};