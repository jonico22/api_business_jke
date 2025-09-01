import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { createSubscriptionMovementSchema, updateSubscriptionMovementSchema } from "./subscriptionMovement.validation";

const prisma = new PrismaClient();

export const subscriptionMovementService = {
  async create(data: z.infer<typeof createSubscriptionMovementSchema>) {
    return prisma.subscriptionMovement.create({
      data});
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
