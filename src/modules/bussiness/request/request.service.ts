import prisma from '@/config/database';
import { userService } from '@/core/user/user.service';
import { roleService } from '@/core/role/role.service';
import { subscriptionService } from '@/modules/bussiness/subscriptions/subscription.service';
import { subscriptionMovementService } from '@/modules/bussiness/subscriptionMovement/subscriptionMovement.service';
import { paymentTransactionService } from '@/modules/bussiness/payment-transactions/paymentTransaction.service';
import { createReceipt } from '@/modules/bussiness/receipt/receipt.service';
import { generateCodeUnique, generateNumericCodeUnique } from '@/utils/generateCode'
import { generateRandomPassword } from '@/utils/hash';
import { sendWelcomeEmail, sendRegistrationEmail } from '@/utils/mailer';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';
import { requestApiSalePost } from '@/services/api-sales.service';

import { RequestStatus, NotificationType } from '@prisma/client';

const newSociety = async (data: any, suscription: string, code: string, plan: any) => {
  const response = await requestApiSalePost('societies', {
    code,
    name: data.businessName,
    subscriptionId: suscription,
    businessName: data.businessName,
    ruc: data.documentNumber || "",
    tradeName: data.businessName,
    maxUsers: plan.maxUsers,
    maxProducts: plan.maxProducts,
    storageLimit: plan.storage * 1024 * 1024,
  });
  return response;
}

const getTariffWithDetails = async (tariffId: string) => {
  const tariff = await prisma.tariff.findUnique({
    where: { id: tariffId },
    include: {
      plan: { include: { paymentFrequency: true } },
      promotion: true
    }
  });
  if (!tariff) throw new Error("Tarifa no encontrada");
  return tariff;
}
const newCreateUser = async (data: any, codeSociety: string, planCode: string | undefined) => {
  const nameRole = `OWNER-${generateCodeUnique()}-${planCode}`;
  await roleService.create({
    code: nameRole,
    name: `titular`,
    societyId: codeSociety,
  });
  const newPassword = generateRandomPassword();
  data.role = nameRole;
  data.password = data.password || newPassword;
  data.typeBP = data.isBusiness ? "EMPRESA" : "PERSONA";
  data.documentNumber = data.documentNumber || "";
  data.name = data.firstName + ' ' + (data.lastName || '');
  data.phone = data.phone || "";
  const user = await userService.createUser(data)
  return {
    user,
    password: newPassword
  }
};

const suscripcion = async (userId: string, requestId: string, codeSociety: string, planId: string, endDate: Date) => {
  const data = await subscriptionService.create({
    userId,
    requestId,
    planId,
    status: 'ACTIVE',
    societyId: codeSociety,
    startDate: new Date(),
    endDate: endDate,
  });
  return subscriptionMovementService.create({
    subscriptionId: data.id,
    newPlanId: planId,
    movementDate: new Date(),
    newEndDate: endDate,
    movementType: 'SUBSCRIBED',
  });
}

const paymentTransaction = async (subscriptionMovementId: string) => {
  return paymentTransactionService.create({
    amount: 0,
    paymentDate: new Date(),
    paymentMethod: 'FREE',
    status: 'COMPLETED',
    subscriptionMovementId,
  });
}

const createReceiptPdf = async (transactionId: string) => {
  const receipt = await createReceipt({
    series: 'R001',
    number: generateNumericCodeUnique(8),
    transactionId,
    currencyId: 'PEN',
    taxId: 'IGV',
    receiptTypeId: 'NF',
    issueDate: new Date(),
    taxAmount: 0.00,
    totalAmount: 0.00,
    status: 'issued',
  });
  return receipt;
}

export const requestService = {
  async create(data: any) {
    const verifyPhoneBussiness = await prisma.bussinessPartner.findFirst({
      where: { email: data.email }
    });
    const verifyTarrif = await prisma.tariff.findFirst({
      where: {
        isActive: true, // <-- Aseguramos tomar la Tarifa Activa actual del plan
        plan: {
          code: data.namePlan,
          isActive: true
        }
      },
      include: { plan: true, promotion: true },
    });
    if (!verifyTarrif) {
      return Promise.reject(new Error('El plan seleccionado no existe'));
    }
    data.tariffId = verifyTarrif.id;
    if (data.email === verifyPhoneBussiness?.email) {
      return Promise.reject(new Error('El correo electronico ya está en uso'));
    }
    if (!data.code) {
      data.code = `REQ-${generateCodeUnique()}`;
    }
    if (data.ruc) {
      data.documentNumber = data.ruc;
    }
    sendRegistrationEmail(data.email, data.firstName, data.lastName, data.code);
    delete data.namePlan;
    delete data.ruc;
    return prisma.request.create({ data });

  },
  findAll: async () => {
    return prisma.request.findMany({
      include: { tariff: true },
      orderBy: { createdAt: "desc" },
    })
  },

  findById: (id: string) =>
    prisma.request.findUnique({
      where: { id },
      include: { tariff: true },
    }),
  update: (id: string, data: any) =>
    prisma.request.update({ where: { id }, data }),
  updateStatus: (id: string, status: RequestStatus) =>
    prisma.request.update({ where: { code: id }, data: { status } }
    ),
  updateStatusVerified: async (id: string, status: RequestStatus) => {
    try {
      const request = await prisma.request.findUnique({ where: { code: id } });
      const codeSociety = `SOC-${generateCodeUnique()}`;
      if (!request) throw new Error("Solicitud no encontrada");
      if (request.status !== RequestStatus.PENDING) {
        throw new Error("La solicitud no está en estado pendiente");
      }
      const tariffDetails = await getTariffWithDetails(request.tariffId);

      const { user, password } = await newCreateUser(request, codeSociety, tariffDetails.plan.code);

      // Calcular la fecha de facturación / fin de suscripción
      let endDate = new Date();
      if (tariffDetails.promotion) {
        // Usa la duración dictada por la Promoción (Ej. Free Trial de 2 Meses o 60 días)
        const unit = tariffDetails.promotion.durationUnit;
        const val = tariffDetails.promotion.durationValue;
        if (unit === 'DAY') endDate = addDays(new Date(), val);
        else if (unit === 'WEEK') endDate = addWeeks(new Date(), val);
        else if (unit === 'MONTH') endDate = addMonths(new Date(), val);
        else if (unit === 'YEAR') endDate = addYears(new Date(), val);
      } else if (tariffDetails.plan.paymentFrequency) {
        // Usa el intervalo de días fijado en la Frecuencia de Pago del Plan (Ej. 30 días, 365 días)
        endDate = addDays(new Date(), tariffDetails.plan.paymentFrequency.intervalDays);
      } else {
        // Por si acaso no hubiera configuración (Failsafe)
        endDate = addDays(new Date(), 30);
      }

      const subscriptionMovement = await suscripcion(user.id, request.id, codeSociety, tariffDetails.plan.id, endDate);
      await newSociety(request, subscriptionMovement.subscriptionId, codeSociety, tariffDetails.plan);
      await sendWelcomeEmail(request.email, request.firstName, request.lastName, request.email, password);
      await paymentTransaction(subscriptionMovement.id);
      //await createReceiptPdf(payment.id);
      await requestService.updateStatus(id, status);
      return request;
    } catch (error) {
      console.log(error);
      return Promise.reject(new Error('Error al actualizar el estado de la solicitud'));
    }

  },
  remove: (id: string) => prisma.request.delete({ where: { id } }),
};