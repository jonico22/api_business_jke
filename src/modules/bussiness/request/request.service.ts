import prisma from '@/config/database';
import { userService } from '@/core/user/user.service';
import { roleService } from '@/core/role/role.service';
import {subscriptionService} from '@/modules/bussiness/subscriptions/subscription.service';
import {subscriptionMovementService} from '@/modules/bussiness/subscriptionMovement/subscriptionMovement.service';
import {paymentTransactionService} from '@/modules/bussiness/payment-transactions/paymentTransaction.service';
import {createReceipt} from '@/modules/bussiness/receipt/receipt.service';
import { generateCodeUnique, generateNumericCodeUnique }  from '@/utils/generateCode'
import { generateRandomPassword } from '@/utils/hash';
import {sendWelcomeEmail, sendRegistrationEmail} from '@/utils/mailer';
import {addDays} from 'date-fns';

const API_SALES_URL = process.env.API_SALES_URL || 'http://localhost:3000';

const requestApiSaleGet = async (path:String) => {
  const response = await fetch(`${API_SALES_URL}/${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Error al crear la solicitud en el servicio de ventas');
  } 
  return response.json();
};

const requestApiSalePost = async (path:String, body:any) => {
  const response = await fetch(`${API_SALES_URL}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Error al crear la solicitud en el servicio de ventas');
  } 
  return response.json();
};

enum RequestStatus {
  Pending = "pending",
  Rejected = "rejected",
  Verified = "verified"
}

const newSociety = async (data: any) => {
  const response = await requestApiSalePost('societies', {
    code: `SOC-${generateCodeUnique()}`,
    name: data.businessName,
  });
  return response;
}

const branchOffice = async (societyId: string) => {
  const response = await requestApiSalePost('branch-offices', {
    name: "Oficina Principal",
    isMain: true,
    societyId,
  });
  return response;
}

const planService = async (data: any) => {
  const tariff = await prisma.tariff.findUnique({
    where: { id: data.tariffId }
  });
  if (!tariff) throw new Error("Tarifa no encontrada");
  return await prisma.plan.findUnique({
    where: { id: tariff.planId }
  });
}
const newCreateUser = async (data: any,society:string) => {  
  const plan = await planService(data);
  const nameRole = `OWNER-${generateCodeUnique()}-${plan?.code}`;
  await roleService.create({
    code: nameRole,
    name: `titular`,
    societyId: society,
  });
  const newPassword = generateRandomPassword();
  data.role = nameRole;
  data.password = data.password || newPassword;
  data.typeBP = data.isBusiness ? "empresa" : "natural";
  data.documentNumber = data.documentNumber || "";
  data.name = data.firstName + ' ' + (data.lastName || '');
  const user = await userService.createUser(data)
  return {
    user,
    password : newPassword
  }
};

const suscripcion = async (userId: string, requestId: string) => {
  const data = await subscriptionService.create({
    userId,
    requestId,
    status: 'ACTIVE',
    startDate: new Date(),
    endDate: addDays(new Date(), 30), // agregar 30 dias a la fecha actual
  });
  return subscriptionMovementService.create({
      subscriptionId: data.id,
      movementDate: new Date(),
      newEndDate: addDays(new Date(), 30), // agregar 30 dias a la fecha actual,
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
    series:'R001',
    number: generateNumericCodeUnique(8),
    transactionId,
    currencyId: 'PEN',
    taxId: 'IGV',
    receiptTypeId: 'NF',
    issueDate: new Date(),
    taxAmount: 0.00,
    totalAmount:0.00,
    status: 'issued',
  });
  return receipt;
}



export const requestService = {
  async create (data: any) {
    const verifyPhoneBussiness = await prisma.bussinessPartner.findFirst({
      where: { email: data.email }
    });
    if (data.email === verifyPhoneBussiness?.email) {
       return Promise.reject(new Error('El correo electronico ya está en uso'));
    }
    if (!data.code) {
      data.code = `REQ-${generateCodeUnique()}`;
    }
    sendRegistrationEmail(data.email, data.firstName, data.lastName, data.code);
    return prisma.request.create({ data });
  },
  findAll: () => prisma.request.findMany({
    include: { tariff: true },
    orderBy: { createdAt: "desc" },
  }),

  findById: (id: string) =>
    prisma.request.findUnique({
      where: { id },
      include: { tariff: true },
    }),
  update: (id: string, data: any) =>
    prisma.request.update({ where: { id }, data }),
  updateStatus: (id: string, status: RequestStatus) =>
    prisma.request.update({ where: { id }, data: { status } }
  ),
  updateStatusVerified: async (id: string, status: RequestStatus) => {
    const request = await requestService.findById(id);
    if (!request) throw new Error("Solicitud no encontrada");
    if (request.status !== RequestStatus.Pending) {
      throw new Error("La solicitud no está en estado pendiente");
    }
    const society = await newSociety(request);
    await branchOffice(society.id);
    const {user,password} = await newCreateUser(request,society.id);
    await sendWelcomeEmail(request.email, request.firstName, request.lastName,request.email, password);
    const subscriptionMovement = await suscripcion(user.id, request.id);
    const payment = await paymentTransaction(subscriptionMovement.id);
    await createReceiptPdf(payment.id);
    await requestService.updateStatus(id, status);
    return request;
  },
  remove: (id: string) => prisma.request.delete({ where: { id } }),
};
