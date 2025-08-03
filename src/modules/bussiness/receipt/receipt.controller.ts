import { Request, Response } from "express";
import * as receiptService from "./receipt.service";
import { receiptSchema, updateReceiptSchema } from "./receipt.schema";
import { generateReceiptPdfBuffer } from "@/utils/pdfkit/generateReceiptPdfBuffer";


/**
 * @swagger
 * /receipts:
 *   post:
 *     summary: Crear nuevo recibo
 *     tags: [Receipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Recibo creado correctamente
 *       400:
 *         description: Error al crear el recibo
 */

export const create = async (req: Request, res: Response) => {
  const parsed = receiptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const receipt = await receiptService.createReceipt(parsed.data);
  res.status(201).json({ data: receipt });
};


/**
 * @swagger
 * /receipts:
 *   get:
 *     summary: Obtener todos los recibos
 *     tags: [Receipt]
 *     responses:
 *       200:
 *         description: Lista de recibos obtenidos correctamente
 */

export const findAll = async (_req: Request, res: Response) => {
  const receipts = await receiptService.getReceipts();
  res.json({ data: receipts });
};

/**
 * @swagger
 * /receipts/{id}:
 *   get:
 *     summary: Obtener recibo por ID
 *     tags: [Receipt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recibo obtenido correctamente
 *       404:
 *         description: Recibo no encontrado
 */


export const findOne = async (req: Request, res: Response) => {
  const receipt = await receiptService.getReceiptById(req.params.id);
  if (!receipt) return res.status(404).json({ message: "Receipt not found" });
  res.json({ data: receipt });
};


/**
 * @swagger
 * /receipts/{id}:
 *   put:
 *     summary: Actualizar recibo por ID
 *     tags: [Receipt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Recibo actualizado correctamente
 *       400:
 *         description: Error al actualizar el recibo
 *       404:  
 *         description: Recibo no encontrado
 * */


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