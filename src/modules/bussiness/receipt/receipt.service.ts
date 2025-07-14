import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import { uploadFileToR2 } from "@/shared/services/upload.service";
import { fileService } from "@/modules/bussiness/files/file.service";
import prisma from '@/config/database';
import QRCode from "qrcode";
import { generateQrAndUpload } from "@/utils/generateQr";

export const createReceipt = async (data: any) => {
   const receipt = await prisma.receipt.create({
      data: {
        ...data,
      },
    });
   // 2. Generar QR con la URL de verificación

    const qrText = `${process.env.PUBLIC_RECEIPT_VERIFY_URL}/${receipt.id}`;
    const qrFileName = `qr-receipt-${receipt.id}`;
    const folder = "qrs/receipts";

    const { key, url } = await generateQrAndUpload(qrText, folder, qrFileName);

    // 3. Registrar el archivo en la tabla File
    await fileService({
      name: `${qrFileName}.png`,
      path: key,
      mimeType: "image/png",
      size: 0, // opcional, puedes estimar el tamaño si es necesario
    });
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
      currency: true,
      tax: true,
      receiptType: true,
    },
  });

  if (!receipt) throw new Error("Comprobante no encontrado");

  // Leer plantilla HTML
  const templatePath = path.join(__dirname, "../../templates/receipt-item.html");
  const template = await fs.readFile(templatePath, "utf8");

  const rows = receipt.items.map((item: { description: any; quantity: number; unitPrice: number; }) => `
    <tr>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>S/. ${item.unitPrice.toFixed(2)}</td>
      <td>S/. ${(item.quantity * item.unitPrice).toFixed(2)}</td>
    </tr>
  `).join("");
  const url = `https://midominio.com/verify-receipt/${receipt.id}`;
  const qrCodeBase64 = await QRCode.toDataURL(url);
  const html = template
    .replace("{{number}}", receipt.number)
    .replace("{{date}}", new Date(receipt.date).toLocaleString("es-PE"))
    .replace("{{status}}", receipt.status)
    .replace("{{customer}}", receipt.customer?.fullName ?? "N/A")
    .replace("{{tax}}", `S/. ${receipt.taxAmount.toFixed(2)}`)
    .replace("{{amount}}", `S/. ${receipt.totalAmount.toFixed(2)}`)
    .replace("{{qr}}", `data:image/png;base64,${qrCodeBase64}`)
    .replace("{{items}}", rows)
    .replace("{{receiptId}}", receipt.id);

  // Generar PDF con Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  // Subir a R2
  const fileName = `receipt-${receipt.number}-${uuidv4()}.pdf`;
  const folder = "receipts";
  const key = `${folder}/${fileName}`;

  await uploadFileToR2(key, pdfBuffer as Buffer, "application/pdf", pdfBuffer.length);

  // Registrar en tabla File
  const fileRecord = await fileService({
    name: fileName,
    path: key,
    mimeType: "application/pdf",
    size: pdfBuffer.length,
  });

  // Enlazar con el comprobante
  await prisma.receipt.update({
    where: { id: receipt.id },
    data: { fileId: fileRecord.id },
  });

  return fileRecord;
};