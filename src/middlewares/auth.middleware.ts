import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

// Extendemos la interfaz de Express para que req.user y req.role sean reconocidos en toda la app
declare global {
  namespace Express {
    interface Request {
      user: any;
      role: string;
      sessionId?: string;
      session?: { id: string; [key: string]: any };
    }
  }
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extracción del token de forma priorizada
    const token =
      req.cookies?.['session-token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No autorizado: Token no proporcionado' });
    }

    // 2. Búsqueda en base de datos
    const session = await prisma.session.findUnique({
      where: { token },
      include: { 
        user: { 
          include: { role: true } 
        } 
      },
    });

    // 3. Validación de vigencia
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Sesión inválida o expirada' });
    }

    // 4. Inyección de datos en el objeto Request
    req.user = session.user;
    req.role = session.user.role.code; 
    req.sessionId = session.id;
    req.session = session;

    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error interno de autenticación' });
    }
  }
};

export default auth;