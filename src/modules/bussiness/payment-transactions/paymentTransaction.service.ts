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
    const { subscriptionMovementId, ...otherData } = data;
    return prisma.paymentTransaction.create({
      data: {
        ...otherData,
        subscriptionMovement: { connect: { id: subscriptionMovementId } }
      } as any
    });
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

  findPending: async () => {
    return prisma.paymentTransaction.findMany({
      where: { status: 'PENDING' },
      include: {
        subscriptionMovement: {
          include: {
            subscription: {
              include: { user: true, plan: true }
            }
          }
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  },

  approve: async (id: string, fileId?: string) => {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id },
      include: { subscriptionMovement: true }
    });

    if (!transaction) throw new Error("Transacción no encontrada");
    if (transaction.status === 'COMPLETED') throw new Error("La transacción ya se encuentra aprobada");

    const updatedTransaction = await prisma.paymentTransaction.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        paymentDate: new Date(),
        fileId: fileId || undefined // Si envían el ID de la imagen/PDF, lo vinculamos
      }
    });

    // Como esta orden fue pre-generada por el CRON con una nueva fecha (newEndDate),
    // debemos impactar oficialmente esta fecha a la Suscripción y reactivarla.
    await prisma.subscription.update({
      where: { id: transaction.subscriptionMovement.subscriptionId },
      data: {
        endDate: transaction.subscriptionMovement.newEndDate,
        lastRenewalDate: new Date(),
        status: 'ACTIVE',
        isActive: true,
        autoRenew: true
      }
    });

    return updatedTransaction;
  }
};