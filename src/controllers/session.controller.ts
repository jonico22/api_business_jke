import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllSessions = async (req: Request, res: Response) => {
  const requester = req.user;

  if (!['admin', 'soporte'].includes(requester.role.name)) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  const sessions = await prisma.session.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(sessions);
};

export const deleteSession = async (req: Request, res: Response) => {
  const requester = req.user;
  const { id } = req.params;

  const session = await prisma.session.findUnique({ where: { id } });

  if (!session) {
    return res.status(404).json({ message: 'Sesión no encontrada' });
  }

  if (session.userId === requester.id) {
    return res.status(403).json({ message: 'No puedes eliminar tu propia sesión activa' });
  }
    // Prevent deletion of the current session
  if (session.id === req.sessionId) {
    return res.status(403).json({ message: 'No puedes eliminar tu propia sesión activa' });
  }

  if (!['admin', 'soporte'].includes(requester.role.name)) {
    return res.status(403).json({ message: 'No autorizado para eliminar sesiones' });
  }

  await prisma.session.delete({ where: { id } });

  res.json({ message: 'Sesión eliminada correctamente' });
};
