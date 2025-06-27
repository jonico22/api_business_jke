import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

interface AuthRequest extends Request {
  user: any;
  sessionId?: string;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No autorizado' });
    
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { include: { role: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Sesión inválida o expirada' });
    }
    req.user = session.user;
    req.sessionId = session.id;
    next();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error interno de autenticación' });
    }
  }
};

export default auth;
