import { Request, Response } from "express";
import * as receiptService from "./receipt.service";
import { receiptSchema, updateReceiptSchema } from "./receipt.schema";
import { generateReceiptPdfBuffer } from "@/utils/pdfkit/generateReceiptPdfBuffer";

export const create = async (req: Request, res: Response) => {
  const parsed = receiptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const receipt = await receiptService.createReceipt(parsed.data);
  res.status(201).json({ data: receipt });
};

export const findAll = async (_req: Request, res: Response) => {
  const receipts = await receiptService.getReceipts();
  res.json({ data: receipts });
};

export const findOne = async (req: Request, res: Response) => {
  const receipt = await receiptService.getReceiptById(req.params.id);
  if (!receipt) return res.status(404).json({ message: "Receipt not found" });
  res.json({ data: receipt });
};

export const update = async (req: Request, res: Response) => {
  const parsed = updateReceiptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const updated = await receiptService.updateReceipt(req.params.id, parsed.data);
  res.json({ data: updated });
};

export const remove = async (req: Request, res: Response) => {
  await receiptService.deleteReceipt(req.params.id);
  res.status(204).send();
};

export const generatePdfAndAttach = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const file = await receiptService.generateAndStoreReceiptPdf(id);
    res.json({ message: "PDF generado y guardado", file });
  } catch (error) {
    res.status(500).json({ message: "Error al generar el PDF", error: error.message });
  }
};

export const previewReceipt = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const buffer = await generateReceiptPdfBuffer(id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=receipt-preview.pdf");
    res.send(buffer);
  } catch (error) {
    console.error("Error al generar vista previa:", error);
    res.status(500).json({ message: "No se pudo generar la vista previa del PDF" });
  }
};