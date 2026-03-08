import prisma from '@/config/database';
import { buildPagination } from '@/utils/query-filter';

export const fileService = async (data: {
  name: string;
  path: string;
  mimeType?: string | null;
  size?: number | null;
  key?: string | null;
  provider?: 'R2' | 'S3' | 'EXTERNAL';
  societyId?: string | null;
}) => {
  return prisma.file.create({ data });
};

export const getFiles = async (societyId: string, query: any) => {
  const { skip, take, page, limit } = buildPagination(query);

  const where = { societyId };

  const [total, files] = await Promise.all([
    prisma.file.count({ where }),
    prisma.file.findMany({
      where,
      skip,
      take,
      orderBy: { uploadedAt: 'desc' as const },
    })
  ]);

  return {
    data: files,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
