import cron from 'node-cron';
import prisma from '@/config/database';
import { sendSubscriptionRenewalReminder, sendSubscriptionExpired, sendSubscriptionCancelledFinal } from './mailer';
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { subscriptionService } from '@/modules/bussiness/subscriptions/subscription.service';
import { createReceipt } from '@/modules/bussiness/receipt/receipt.service';

export function initCronJobs() {
    // Ejecutar todos los días a la medianoche '0 0 * * *'
    // Para pruebas puedes cambiarlo a '* * * * *' (cada minuto)
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] ⏰ Iniciando revisión diaria de suscripciones...');
        try {
            const today = new Date();

            // ---------------------------------------------------------
            // 1. Recordatorio 7 días antes de expirar y Creación de Orden
            // ---------------------------------------------------------
            const targetDate = addDays(today, 7);
            const startOfTargetDay = startOfDay(targetDate);
            const endOfTargetDay = endOfDay(targetDate);

            const expiringSoon = await prisma.subscription.findMany({
                where: {
                    status: 'ACTIVE',
                    endDate: {
                        gte: startOfTargetDay,
                        lte: endOfTargetDay
                    }
                },
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
                    },
                    user: { include: { role: true } },
                    AuthorizedUserSubscription: { include: { user: { include: { role: true } } } }
                }
            });

            const rolesToNotify = ['OWNER', 'BUSINESS_MANAGER'];

            for (const sub of expiringSoon) {
                // Verificar si ya se le emitió un cobro pendiente para evitar repetirlo en caso de re-runs
                const existingPending = await prisma.paymentTransaction.findFirst({
                    where: {
                        status: 'PENDING',
                        subscriptionMovement: {
                            subscriptionId: sub.id,
                            movementType: 'RENEWAL'
                        }
                    }
                });

                if (!existingPending) {
                    const isPublicReview = sub.request?.tariff?.promotion?.code === 'BETA';
                    const transactionStatus = isPublicReview ? 'COMPLETED' : 'PENDING';
                    const transactionAmount = isPublicReview ? 0 : sub.plan.price;
                    const newEndDate = addDays(sub.endDate, 30);

                    const newMovement = await prisma.subscriptionMovement.create({
                        data: {
                            subscriptionId: sub.id,
                            movementType: 'RENEWAL',
                            movementDate: new Date(),
                            previousEndDate: sub.endDate,
                            newEndDate: newEndDate, // Proyección a 30 días
                            previousPlanId: sub.planId,
                            newPlanId: sub.planId,
                            notes: isPublicReview ? 'Renovación automática a costo 0 por periodo de Beta/Prueba' : 'Orden de cobro preventiva generada automáticamente (7 días antes)',
                            paymentTransactions: {
                                create: {
                                    amount: transactionAmount,
                                    paymentDate: new Date(),
                                    paymentMethod: isPublicReview ? 'FREE' : 'OTHER',
                                    status: transactionStatus,
                                    description: `Renovación de Plan ${sub.plan.name}${isPublicReview ? ' (Public Review)' : ''}`
                                }
                            }
                        },
                        include: { paymentTransactions: true }
                    });

                    // Si es Public Review, la suscripción se renueva oficialmente de inmediato sin esperar pago.
                    if (isPublicReview) {
                        await prisma.subscription.update({
                            where: { id: sub.id },
                            data: {
                                endDate: newEndDate,
                                lastRenewalDate: new Date()
                            }
                        });

                        if (newMovement.paymentTransactions && newMovement.paymentTransactions.length > 0) {
                            const pTxId = newMovement.paymentTransactions[0].id;
                            try {
                                await createReceipt({
                                    transactionId: pTxId,
                                    series: 'FREE',
                                    number: `F000-${pTxId.substring(0, 6).toUpperCase()}`,
                                    taxAmount: 0,
                                    totalAmount: 0,
                                    status: 'issued',
                                    notes: 'Renovación automática a costo 0 por periodo de Beta/Prueba',
                                    currencyId: 'PEN',
                                    taxId: 'IGV',
                                    receiptTypeId: 'NF'
                                });
                            } catch (e) {
                                console.error('[CRON] Error generando comprobante gratis:', e);
                            }
                        }
                    }

                    const emailsToNotify = new Set<string>();
                    if (sub.user?.email && sub.user.role?.code && rolesToNotify.includes(sub.user.role.code)) {
                        emailsToNotify.add(sub.user.email);
                    }
                    sub.AuthorizedUserSubscription?.forEach(auth => {
                        if (auth.user?.email && auth.user.role?.code && rolesToNotify.includes(auth.user.role.code)) {
                            emailsToNotify.add(auth.user.email);
                        }
                    });

                    for (const email of emailsToNotify) {
                        console.log(`[CRON] Enviando recordatorio e invoice a: ${email}`);
                        await sendSubscriptionRenewalReminder(email, 7, sub.endDate);
                    }
                }
            }

            // ---------------------------------------------------------
            // 2. Desactivar Suscripciones Expiradas
            // ---------------------------------------------------------
            // Si la endDate ya pasó y sigue ACTIVE, significa que no se registró el pago a tiempo
            const expiredSubs = await prisma.subscription.findMany({
                where: {
                    status: 'ACTIVE',
                    endDate: { lt: today }
                },
                include: {
                    user: { include: { role: true } },
                    AuthorizedUserSubscription: { include: { user: { include: { role: true } } } }
                }
            });

            for (const sub of expiredSubs) {
                // Marcamos como inactivo/expirado en base de datos
                await prisma.subscription.update({
                    where: { id: sub.id },
                    data: { status: 'EXPIRED', isActive: false }
                });

                const emailsToNotify = new Set<string>();
                if (sub.user?.email && sub.user.role?.code && rolesToNotify.includes(sub.user.role.code)) {
                    emailsToNotify.add(sub.user.email);
                }
                sub.AuthorizedUserSubscription?.forEach(auth => {
                    if (auth.user?.email && auth.user.role?.code && rolesToNotify.includes(auth.user.role.code)) {
                        emailsToNotify.add(auth.user.email);
                    }
                });

                for (const email of emailsToNotify) {
                    console.log(`[CRON] Enviando aviso de expiración a: ${email}`);
                    await sendSubscriptionExpired(email);
                }
            }

            // ---------------------------------------------------------
            // 3. Cancelar definitivamente suscripciones tras 7 días de Gracia
            // ---------------------------------------------------------
            // Busca las que están en EXPIRED y su fecha de fin fue hace exactamente 7 días
            const cancelDate = subDays(today, 7);
            const startOfCancelDay = startOfDay(cancelDate);
            const endOfCancelDay = endOfDay(cancelDate);

            const gracePeriodFinalSubs = await prisma.subscription.findMany({
                where: {
                    status: 'EXPIRED',
                    endDate: {
                        gte: startOfCancelDay,
                        lte: endOfCancelDay
                    }
                },
                include: {
                    user: { include: { role: true } },
                    AuthorizedUserSubscription: { include: { user: { include: { role: true } } } }
                }
            });

            for (const sub of gracePeriodFinalSubs) {
                // Registrar movimiento y cancelar
                await prisma.subscription.update({
                    where: { id: sub.id },
                    data: { status: 'INACTIVE', isActive: false }
                });

                await prisma.subscriptionMovement.create({
                    data: {
                        subscriptionId: sub.id,
                        movementType: 'CANCELLATION',
                        movementDate: new Date(),
                        previousEndDate: sub.endDate,
                        newEndDate: sub.endDate,
                        notes: 'Cancelación automática por fin de periodo de gracia (7 días)'
                    }
                });

                const emailsToNotify = new Set<string>();
                if (sub.user?.email && sub.user.role?.code && rolesToNotify.includes(sub.user.role.code)) {
                    emailsToNotify.add(sub.user.email);
                }
                sub.AuthorizedUserSubscription?.forEach(auth => {
                    if (auth.user?.email && auth.user.role?.code && rolesToNotify.includes(auth.user.role.code)) {
                        emailsToNotify.add(auth.user.email);
                    }
                });

                for (const email of emailsToNotify) {
                    console.log(`[CRON] Enviando aviso de CADUCIDAD FINAL a: ${email}`);
                    await sendSubscriptionCancelledFinal(email);
                }
            }

            console.log(`[CRON] ✅ Tareas finalizadas. Avisos por vencer: ${expiringSoon.length}. Entran en Gracia (Expiradas): ${expiredSubs.length}. Canceladas definitivas: ${gracePeriodFinalSubs.length}`);
        } catch (error) {
            console.error('[CRON] ❌ Error ejecutando tareas:', error);
        }
    }, {
        scheduled: true,
        timezone: "America/Lima"
    });
}
