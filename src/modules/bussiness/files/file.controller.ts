import { Request, Response } from "express";
import { uploadFileToR2 } from "@/shared/services/upload.service";
import { prisma } from "@/config/database";
import {fileService} from "./file.service"

// Al subir archivo
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const folder = req.body.folder || 'default'; // Carpeta desde el frontend

    if (!file) return res.status(400).json({ message: 'Archivo no proporcionado' });

    const key = `${folder}/${file.originalname}`;

    const result = await uploadFileToR2(key, file.buffer, file.mimetype, file.size);

    await fileService({
      name: file.originalname,
      path: key,
      mimeType: file.mimetype,
      size: file.size,
    });

    res.status(201).json({ message: 'Archivo subido con éxito', file: result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error al subir el archivo' });
  }
};


export const deleteFile = async (req: Request, res: Response) => {
  const { id } = req.params;

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return res.status(404).json({ message: "Archivo no encontrado" });

  // Eliminar de R2
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const { r2Client } = await import("@/config/r2.config");

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: file.key,
    })
  );

  await prisma.file.delete({ where: { id } });

  res.json({ message: "Archivo eliminado exitosamente" });
};