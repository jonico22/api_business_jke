import prisma from '@/config/database';
import { z } from "zod";
import { createSubscriptionMovementSchema, updateSubscriptionMovementSchema } from "./subscriptionMovement.validation";

export const subscriptionMovementService = {
  async create(data: z.infer<typeof createSubscriptionMovementSchema>) {
    const { subscriptionId, paymentTransactionId, newPlanId, previousPlanId, ...otherData } = data;
    return prisma.subscriptionMovement.create({
      data: {
        ...otherData,
        subscription: { connect: { id: subscriptionId } },
        newPlan: newPlanId ? { connect: { id: newPlanId } } : undefined,
        previousPlan: previousPlanId ? { connect: { id: previousPlanId } } : undefined,
        paymentTransactions: paymentTransactionId ? { connect: { id: paymentTransactionId } } : undefined
      } as any
    });
  },

  async getAll() {
    return prisma.subscriptionMovement.findMany({
      include: {
        subscription: {
          select: { id: true, userId: true, request: true, endDate: true },
        },
      },
    });
  },

  async getById(id: string) {
    return prisma.subscriptionMovement.findUnique({
      where: { id },
      include: {
        subscription: {
          select: { id: true, userId: true, request: true, endDate: true },
        },
      },
    });
  },

  async update(id: string, data: z.infer<typeof updateSubscriptionMovementSchema>) {
    return prisma.subscriptionMovement.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.subscriptionMovement.delete({
      where: { id },
    });
  },
};
