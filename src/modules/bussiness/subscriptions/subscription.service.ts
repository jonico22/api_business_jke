import prisma from '@/config/database';
import { buildPagination } from '@/utils/query-filter';
import { subscriptionMovementService } from '@/modules/bussiness/subscriptionMovement/subscriptionMovement.service';
import { addDays, differenceInDays } from 'date-fns';

export const subscriptionService = {
  create: (data: any) => prisma.subscription.create({ data }),
  findAll: async (societyId: string, query: any) => {
    const { skip, take, page, limit } = buildPagination(query);
    const where = { societyId };

    const [total, subscriptions] = await Promise.all([
      prisma.subscription.count({ where }),
      prisma.subscription.findMany({
        where,
        skip,
        take,
        include: {
          user: true,
          plan: true,
          request: {
            include: {
              tariff: {
                include: {
                  promotion: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' as const },
      })
    ]);

    const subscriptionsWithFlag = subscriptions.map((sub: any) => ({
      ...sub,
      isPublicReview: sub.request?.tariff?.promotion?.code === 'BETA'
    }));

    return {
      data: subscriptionsWithFlag,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  findById: async (id: string) => {
    // Paralelizar ambas queries independientes
    const [sub, pendingPayment] = await Promise.all([
      prisma.subscription.findUnique({
        where: { id },
        include: {
          plan: true,
          request: {
            include: {
              tariff: {
                include: {
                  promotion: true
                }
              }
            }
          }
        },
      }),
      prisma.paymentTransaction.findFirst({
        where: {
          status: 'PENDING',
          subscriptionMovement: {
            subscriptionId: id,
            movementType: 'RENEWAL'
          }
        }
      })
    ]);

    if (!sub) return null;

    const isNearingExpiration = differenceInDays(sub.endDate, new Date()) <= 7 || sub.endDate < new Date();

    return {
      ...sub,
      isPublicReview: (sub as any).request?.tariff?.promotion?.code === 'BETA',
      hasPendingPayment: !!pendingPayment,
      isNearingExpiration
    };
  },
  update: (id: string, data: any) => prisma.subscription.update({ where: { id }, data }),
  remove: (id: string) => prisma.subscription.delete({ where: { id } }),

  renew: async (subscriptionId: string, options?: { fileId?: string, paymentMethod?: string, referenceCode?: string }) => {
    const currentSub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    });
    if (!currentSub) throw new Error("Suscripción no encontrada");

    // Buscar si ya existe una orden pendiente generada por el Cronjob
    const existingPending = await prisma.paymentTransaction.findFirst({
      where: {
        status: 'PENDING',
        subscriptionMovement: {
          subscriptionId: subscriptionId,
          movementType: 'RENEWAL'
        }
      },
      include: { subscriptionMovement: true }
    });

    if (existingPending) {
      // El CRON ya había creado el Movement + Transaction.
      // Solo asociamos la imagen de la transferencia subida por el usuario
      const updatedPayment = await prisma.paymentTransaction.update({
        where: { id: existingPending.id },
        data: {
          fileId: options?.fileId || null,
          paymentMethod: (options?.paymentMethod as any) || 'TRANSFER',
          referenceCode: options?.referenceCode || null,
        }
      });
      return { message: "Comprobante recibido. En proceso de validación por los administradores.", paymentId: updatedPayment.id };
    }

    // Si no existía PENDING (por ej. quiere renovar meses antes que expire o el Cron falló), generamos uno nuevo "bajo revisión"
    const newEndDate = addDays(currentSub.endDate, 30);

    // No marcamos isActive = true aun, ya que es "Pago Manual". Debe validarlo el ADMIN.
    await prisma.subscriptionMovement.create({
      data: {
        subscriptionId: currentSub.id,
        movementType: 'RENEWAL',
        movementDate: new Date(),
        previousEndDate: currentSub.endDate,
        newEndDate: newEndDate,
        previousPlanId: currentSub.planId,
        newPlanId: currentSub.planId,
        notes: 'Renovación iniciada por el usuario (A la espera de confirmación del pago)',
        paymentTransactions: {
          create: {
            amount: currentSub.plan.price,
            paymentDate: new Date(),
            paymentMethod: (options?.paymentMethod as any) || 'TRANSFER',
            status: 'PENDING',
            referenceCode: options?.referenceCode || null,
            fileId: options?.fileId || null,
            description: `Renovación Manual: Plan ${currentSub.plan.name}`
          }
        }
      }
    });

    return { message: "Comprobante de pago enviado correctamente. Tu cuenta se renovará al ser validado por nuestro equipo.", status: "PENDING" };
  },

  upgrade: async (subscriptionId: string, newPlanId: string) => {
    const currentSub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!currentSub) throw new Error("Suscripción no encontrada");

    const newEndDate = addDays(new Date(), 30); // Nuevo ciclo de 30 días

    await subscriptionMovementService.create({
      subscriptionId: currentSub.id,
      movementType: 'UPGRADE',
      movementDate: new Date(),
      previousEndDate: currentSub.endDate,
      newEndDate: newEndDate,
      previousPlanId: currentSub.planId,
      newPlanId: newPlanId,
    });

    /*
    const payment = await paymentTransactionService.create({
      amount: 50.00, // Costo de upgrade referencial
      paymentDate: new Date(),
      paymentMethod: 'CREDIT',
      status: 'COMPLETED',
      subscriptionMovementId: movement.id,
    });*/

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: newPlanId,
        endDate: newEndDate,
        lastRenewalDate: new Date(),
        status: 'ACTIVE'
      }
    });
  },

  cancel: async (subscriptionId: string, notes?: string) => {
    const currentSub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!currentSub) throw new Error("Suscripción no encontrada");

    // Registrar el movimiento de cancelación
    await subscriptionMovementService.create({
      subscriptionId: currentSub.id,
      movementType: 'CANCELLATION',
      movementDate: new Date(),
      previousEndDate: currentSub.endDate,
      newEndDate: currentSub.endDate, // Se mantiene la fecha de fin o se ajusta a hoy si es inmediata
      previousPlanId: currentSub.planId,
      newPlanId: currentSub.planId,
      notes: notes || 'Cancelación solicitada por el usuario',
    });

    // Actualizar el estado de la suscripción
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'INACTIVE', // O 'EXPIRED' u otro estado conveniente
        isActive: false,
        autoRenew: false
      }
    });
  },

  reactivate: async (subscriptionId: string) => {
    const currentSub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!currentSub) throw new Error("Suscripción no encontrada");

    // Verificar si aún tiene días a su favor
    const isStillValid = currentSub.endDate > new Date();

    await subscriptionMovementService.create({
      subscriptionId: currentSub.id,
      movementType: 'SUBSCRIBED', // O uno nuevo como REACTIVATED si se agrega a BD
      movementDate: new Date(),
      previousEndDate: currentSub.endDate,
      newEndDate: currentSub.endDate,
      previousPlanId: currentSub.planId,
      newPlanId: currentSub.planId,
      notes: 'Reactivación manual de suscripción cancelada',
    });

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: isStillValid ? 'ACTIVE' : 'EXPIRED',
        isActive: isStillValid,
        autoRenew: true
      }
    });
  },

  toggleAutoRenew: async (subscriptionId: string, autoRenew: boolean) => {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { autoRenew }
    });
  },

  getHistory: async (subscriptionId: string) => {
    return prisma.subscriptionMovement.findMany({
      where: { subscriptionId },
      include: {
        newPlan: true,
        previousPlan: true,
      },
      orderBy: { movementDate: 'desc' },
    });
  },

  getBilling: async (subscriptionId: string) => {
    return prisma.paymentTransaction.findMany({
      where: {
        subscriptionMovement: {
          subscriptionId
        }
      },
      include: {
        subscriptionMovement: {
          include: { newPlan: true }
        }
      },
      orderBy: { paymentDate: 'desc' },
    });
  },
};
