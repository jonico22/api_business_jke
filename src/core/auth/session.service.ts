import prisma from '@/config/database';
import { randomBytes } from "crypto";

const REGENERATE_SESSION_TOKEN = process.env.REGENERATE_SESSION_TOKEN === "true";

export const sessionService = {
  async renew(sessionId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) return null;

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    const newToken = REGENERATE_SESSION_TOKEN
          ? randomBytes(32).toString("hex")
          : session.token;
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        token: newToken,
        expiresAt,
        updatedAt: new Date(),
      },
    });

    return {
      token: newToken,
      expiresAt,
    };
  },

  async verifyToken(token: string) {
    const session = await prisma.session.findFirst({
      where: { token, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!session) return null;

    return {
      id: session.id,
      userId: session.userId,
      user: session.user,
      expiresAt: session.expiresAt,
    };
  },
};
