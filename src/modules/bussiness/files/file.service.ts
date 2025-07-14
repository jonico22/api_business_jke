// src/core/file/file.service.ts
import { prisma } from "@/config/database";

export const fileService = async (data: {
  name: string;
  path: string;
  mimeType: string;
  size: number;
}) => {
  return prisma.file.create({ data });
};
