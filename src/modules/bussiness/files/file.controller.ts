import { Request, Response } from "express";
import { uploadFileToR2 } from "@/shared/services/upload.service";
import prisma from '@/config/database';
import { fileService } from "./file.service";

// Al subir archivo
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const folder = req.body.folder || 'default'; // Carpeta desde el frontend

    if (!file) return res.status(400).json({ message: 'Archivo no proporcionado' });

    const result = await uploadFileToR2(file, folder);
    await fileService({
      name: result.name,
      path: result.url,
      mimeType: result.type,
      size: result.size,
      key: result.key,
      provider: 'R2',
      societyId: req.societyId,
    });

    res.status(201).json({ message: 'Archivo subido con éxito', file: result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error al subir el archivo' });
  }
};

export const registerExternalFile = async (req: Request, res: Response) => {
  try {
    const { name, url } = req.body;
    if (!name || !url) {
      return res.status(400).json({ message: 'Nombre y URL son requeridos' });
    }

    const file = await fileService({
      name,
      path: url,
      provider: 'EXTERNAL',
      societyId: req.societyId,
    });

    res.status(201).json({ message: 'Archivo externo registrado con éxito', file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el archivo externo' });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  const { id } = req.params;

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return res.status(404).json({ message: "Archivo no encontrado" });

  // Eliminar del almacenamiento solo si es R2 y tiene key
  if (file.provider === 'R2' && file.key) {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const { r2Client } = await import("@/config/r2.config");

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: file.key,
      })
    );
  }

  await prisma.file.delete({ where: { id } });
  res.json({ message: "Archivo eliminado exitosamente" });
};

export const getFile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return res.status(404).json({ message: "Archivo no encontrado" });
  res.json(file);
};

export const listFiles = async (req: Request, res: Response) => {
  const societyId = req.societyId;
  if (!societyId) return res.status(401).json({ message: "Contexto de sociedad no encontrado" });

  const result = await require('./file.service').getFiles(societyId, req.query);
  res.json(result);
};