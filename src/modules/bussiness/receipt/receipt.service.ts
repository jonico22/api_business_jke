import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import { uploadFileToR2,uploadFileTypeToR2 } from "@/shared/services/upload.service";
import { fileService } from "@/modules/bussiness/files/file.service";
import prisma from '@/config/database';
import QRCode from "qrcode";
import { generateQrAndUpload } from "@/utils/generateQr";
import { sendSubscriptionPaymentEmail } from "@/utils/mailer";
// Define the path to the template file using path.join
import {generateReceiptHtml} from '@/templates/receipt.template'

export const createReceipt = async (data: any) => {
   const receipt = await prisma.receipt.create({
      data: {
        ...data,
      },
    });
   // 2. Generar QR con la URL de verificación
   // const qrText = `${process.env.PUBLIC_RECEIPT_VERIFY_URL}/${receipt.id}`;
   // const qrFileName = `qr-receipt-${receipt.id}`;
   // const folder = "qrs/receipts";
   // await generateQrAndUpload(qrText, folder, qrFileName);
   setTimeout(async() => {
    await generateAndStoreReceiptPdf(receipt.id);
   }, 100);
  return receipt;
};

export const getReceipts = async () => {
  return prisma.receipt.findMany({
    include: {
      currency: true,
      tax: true,
      receiptType: true,
      file: true,
    },
  });
};

export const getReceiptById = async (id: string) => {
  return prisma.receipt.findUnique({
    where: { id },
    include: {
      currency: true,
      tax: true,
      receiptType: true,
      file: true,
    },
  });
};

export const updateReceipt = async (id: string, data: any) => {
  return prisma.receipt.update({
    where: { id },
    data,
  });
};

export const deleteReceipt = async (id: string) => {
  return prisma.receipt.delete({ where: { id } });
};

export const generateAndStoreReceiptPdf = async (receiptId: string) => {
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: {
      transaction: true,
      currency: true,
      tax: true,
      receiptType: true,
    },
  });
  const transaction = await prisma.paymentTransaction.findUnique({
    where: { id: receipt?.transactionId },
    include: {  subscriptionMovement: true},
  });

  const suscripcion = await prisma.subscriptionMovement.findUnique({
    where: { id: transaction?.subscriptionMovementId },
    include: {  subscription: true},
  });

  const request = await prisma.request.findUnique({
    where: { id: suscripcion?.subscription.requestId }
  });

  const tariff = await prisma.tariff.findUnique({
    where: { id: request?.tariffId },
    include: { plan: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: suscripcion?.subscription.userId },
  });

  const bussiness = await prisma.bussinessPartner.findFirst({
    where: { userId: user?.id },
  });

  if (!receipt) throw new Error("Comprobante no encontrado");

  // Leer plantilla HTML
  //const templatePath = path.join(__dirname, "../../../../templates/receipt-item.html");
  console.log(generateReceiptHtml)
  try {
    const template = generateReceiptHtml();

  // Generar las filas de la tabla de items de forma iterativa
  let itemRows = "";
  // Asumimos que `items` es un array de arrays, ej: [["Descripción", cantidad, precioUnitario], ...]
    const description = tariff?.plan.name ? tariff.plan.name : "N/A";
    const quantity = tariff?.plan.name ? 1 : 0;
    const unitPrice = tariff?.plan.price ? tariff.plan.price : 0;
    //
    itemRows += `
      <tr>
        <td>${description}</td>
        <td>${quantity}</td>
        <td>S/. ${unitPrice.toFixed(2)}</td>
        <td>S/. ${(quantity * unitPrice).toFixed(2)}</td>
      </tr>`;
  
  // Mejorar el reemplazo de variables usando una función para mayor claridad y evitar errores de concatenación
  function replaceTemplateVars(templateStr: string, vars: Record<string, string>): string {
    return Object.entries(vars).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, "g"), value),
      templateStr
    );
  }

  const html = replaceTemplateVars(template, {
    number: receipt.series + " - " + receipt.number,
    date: new Date(receipt.dueDate).toLocaleDateString("es-PE"),
    status: receipt.status, //eliminar
    customer: `${bussiness?.lastName ?? "N/A"} ${bussiness?.firstName ?? "N/A"}`,
    tax: `S/. ${receipt.taxAmount.toFixed(2)}`,
    amount: `S/. ${receipt.totalAmount.toFixed(2)}`,
    items: itemRows,
    receiptId: receipt.id,
  });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();
  
  // Subir a R2
  const fileName = `receipt-${receipt.number}-${uuidv4()}.pdf`;
  const folder = "receipts";
  const key = `${folder}/${fileName}`;
  const fileUrl = `${process.env.R2_PUBLIC_URL}/${process.env.R2_BUCKET}/${key}`;

  await uploadFileTypeToR2(key, pdfBuffer as Buffer, "application/pdf", pdfBuffer.length);

  // Registrar en tabla File
  const fileRecord = await fileService({
    name: fileName,
    path: fileUrl,
    mimeType: "application/pdf",
    size: pdfBuffer.length,
    key: key,
  });
  
    // Enlazar con el comprobante
    await prisma.receipt.update({
      where: { id: receipt.id },
      data: { fileId: fileRecord.id },
    });

    setTimeout(() => {
      sendSubscriptionPaymentEmail(user?.email || "", receipt.totalAmount, receipt.currency.name, fileUrl);
    }, 200);
  } catch (error) {
    
    console.error("Error reading template file:", error);
    return error;
  }

  
  
};