import prisma from '../config/database';

export const cleanupExpiredResetTokens = async (): Promise<void> => {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  console.log(`🧹 Tokens expirados eliminados: ${result.count}`);
};
