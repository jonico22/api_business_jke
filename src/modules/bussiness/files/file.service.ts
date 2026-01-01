import prisma from '@/config/database';

export const fileService = async (data: {
  name: string;
  path: string;
  mimeType: string;
  size: number;
  key: string;
}) => {
  return prisma.file.create({ data });
};
