import puppeteer from "puppeteer";
import { getReceiptById } from "@/modules/bussiness/receipt/receipt.service";
import { generateReceiptHtml } from "@/templates/receipt.template";

export const generateReceiptPdfBuffer = async (receiptId: string): Promise<Buffer | Uint8Array> => {
  const receipt = await getReceiptById(receiptId); // busca con relaciones necesarias
  const html = generateReceiptHtml(receipt);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const buffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
  });

  await browser.close();
  return buffer;
};
