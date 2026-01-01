import prisma from '@/config/database';
import { z } from "zod";
import { CreatePaymentTransactionSchema } from './paymentTransaction.validation';

export const paymentTransactionService = {
  create: async (data: z.infer<typeof CreatePaymentTransactionSchema>) => {
    const subscriptionMovement = await prisma.subscriptionMovement.findUnique({
      where: { id: data.subscriptionMovementId },
    });
    // Si no existe, lanzar un error claro que puede ser manejado por el controlador
    if (!subscriptionMovement) {
      throw new Error(`El movimiento de suscripción con ID '${data.subscriptionMovementId}' no fue encontrado.`);
    }
    return prisma.paymentTransaction.create({ data });
  },
  findAll: async () => {
    return prisma.paymentTransaction.findMany({
      include: {
        subscriptionMovement: {
          include: {
            subscription: true,
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
        subscriptionMovement: true
      }
    });
  },
  remove: async (id: string) => {
    return prisma.paymentTransaction.delete({ where: { id } });
  },
};