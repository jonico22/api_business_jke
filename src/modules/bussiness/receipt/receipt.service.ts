
import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import { uploadFileTypeToR2 } from "@/shared/services/upload.service";
import { fileService } from "@/modules/bussiness/files/file.service";
import prisma from '@/config/database';
//import QRCode from "qrcode";
//import { generateQrAndUpload } from "@/utils/generateQr";
import { sendSubscriptionPaymentEmail } from "@/utils/mailer";
// Define the path to the template file using path.join
import {generateReceiptHtml} from '@/templates/receipt.template'

export const createReceipt = async (data: any) => {
   if (data.currencyId){
    const currency = await prisma.currency.findUnique({
      where: { code: data.currencyId },
    });
    data.currencyId = currency?.id;
   }
   if (data.taxId){
      const tax = await prisma.tax.findUnique({
        where: { code: data.taxId },
      });
      data.taxId = tax?.id;
   }
   if (data.receiptTypeId){
      const receiptType = await prisma.receiptType.findUnique({
        where: { code: data.receiptTypeId },
      });
      data.receiptTypeId = receiptType?.id;
   }
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
  // 1. Consolidate data fetching into a single query
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: {
      currency: true,
      tax: true,
      receiptType: true,
      transaction: {
        include: {
          subscriptionMovement: {
            include: {
              subscription: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // 2. Add a null check
  if (!receipt) {
    throw new Error("Comprobante no encontrado");
  }

  try {
    // 3. Directly call the HTML generation function
    const html = generateReceiptHtml(receipt as any); // Cast to any to satisfy the complex type, as we know it's correct

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
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

    const userEmail = receipt.transaction?.subscriptionMovement?.subscription?.user?.email;
    if (userEmail) {
      setTimeout(() => {
        sendSubscriptionPaymentEmail(userEmail, receipt.totalAmount, receipt.currency.name, fileUrl);
      }, 200);
    }
  } catch (error) {
    console.error("Error generating or storing PDF:", error);
    // No retornar el error directamente, podría causar un ciclo si el error es de la base de datos
    throw new Error("Failed to process PDF for receipt " + receiptId);
  }
};