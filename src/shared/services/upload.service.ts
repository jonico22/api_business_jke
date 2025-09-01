import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/config/r2.config";
import { randomUUID } from "crypto";
import path from "path";


export const uploadFileToR2 = async (file: Express.Multer.File,folder:string) => {
  const extension = path.extname(file.originalname);
  const filename = `${folder}/${randomUUID()}${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
  });
  

  const result = await r2Client.send(command);
  console.log('Archivo subido a R2 con clave:', result);
  const fileUrl = `${process.env.R2_PUBLIC_URL}/${process.env.R2_BUCKET}/${filename}`;

  return {
    url: fileUrl,
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
    key: filename,
  };
};

/*
export const uploadFileToR2 = async (
  key: string,
  buffer: Buffer,
  contentType: string,
  contentLength: number
) => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  await r2Client.send(command);
};*/