import prisma from '@/config/database';

export const fileService = async (data: {
  name: string;
  path: string;
  mimeType?: string | null;
  size?: number | null;
  key?: string | null;
  provider?: 'R2' | 'S3' | 'EXTERNAL';
}) => {
  return prisma.file.create({ data });
};
