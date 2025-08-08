import prisma from '@/config/database';
import { createOrderPaymentSchema, updateOrderPaymentSchema } from './orderPayment.validation'


export const orderPaymentService = {
  create: async (data: any) => {
    const validated = createOrderPaymentSchema.parse(data)
    return prisma.orderPayment.create({ data: validated })
  },

  findAll: async (filters: any = {}) => {
    return prisma.orderPayment.findMany({
      where: filters,
      include: {
        order: true,
        SocietyReceipt: true,
        ReceivedConsignmentSettlement: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById: async (id: string) => {
    return prisma.orderPayment.findUnique({
      where: { id },
      include: {
        order: true,
        SocietyReceipt: true,
        ReceivedConsignmentSettlement: true,
      },
    })
  },

  update: async (id: string, data: any) => {
    const validated = updateOrderPaymentSchema.parse(data)
    return prisma.orderPayment.update({ where: { id }, data: validated })
  },

  delete: async (id: string) => {
    return prisma.orderPayment.delete({ where: { id } })
  },
}
