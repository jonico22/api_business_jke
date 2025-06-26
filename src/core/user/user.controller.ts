// src/core/user/user.controller.ts
import { Request, Response } from 'express';
import { userService } from './user.service';
import { createUserSchema, updateMeSchema } from './user.validation';
import { buildPrismaFilters,buildPagination } from '@/utils/query-filter';
import { successResponse, errorResponse } from '@/utils/response';

import { generateEmailToken,verifyEmailToken } from '@/utils/token-email';
import { sendEmailVerification } from '@/utils/mailer';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface UserRole {
      name: string;
      [key: string]: any;
    }
    interface User {
      id: string;
      role: UserRole;
      [key: string]: any;
    }
    interface Request {
      user: User;
    }
  }
}

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Error en los datos
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const data = createUserSchema.parse(req.body);
    const result = await userService.createUser(data);
    const token = generateEmailToken(result.email);
    await sendEmailVerification(result.email, token);
    res.status(201).json(result);
  } catch (error) {
   const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Perfil del usuario
 * 
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await userService.getProfile(userId);
    res.json(user);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Error en los datos
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const data = updateMeSchema.parse(req.body);
    const result = await userService.updateProfile(userId, data);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Usuario eliminado
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;
    const result = await userService.deleteUser(userId, currentUser);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};

export const activateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const requester = req.user;
    if (!['admin', 'soporte'].includes(requester.role.name)) {
      return res.status(403).json({ message: 'No autorizado para activar usuarios' });
    }
    const result = await userService.activateUser(userId);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
};

export const unlockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const requester = req.user;
    if (!['admin', 'soporte'].includes(requester.role.name)) {
      return res.status(403).json({ message: 'No autorizado para desbloquear usuarios' });
    }
    const result = await userService.unlockUser(userId);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    if (!['admin', 'soporte'].includes(requester.role.name)) {
      return res.status(403).json({ message: 'No autorizado para ver sesiones' });
    }
    const sessions = await userService.getAllSessions();
    res.json(sessions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  } 
}

export const deleteSessionUser = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const requester = req.user;
    if (!['admin', 'soporte'].includes(requester.role.name)) {
      return res.status(403).json({ message: 'No autorizado para eliminar sesiones' });
    }
    const result = await userService.deleteSession(sessionId, requester);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}

export const deleteAllSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const requester = req.user;
    const sessionId = (req as any).sessionId;
    if (!['admin', 'soporte'].includes(requester.role.name)) {
      return res.status(403).json({ message: 'No autorizado para eliminar sesiones de usuarios' });
    }
    const result = await userService.deleteUserSessions(userId,sessionId);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtro por nombre
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
export const filterUsers = async (req: Request, res: Response) => {
  try {
    const filters = buildPrismaFilters(req.query);
    const { skip, take, page, limit,warnings  } = buildPagination(req.query);

    const [users, total] = await Promise.all([
      userService.getUsers(filters, skip, take),
      userService.countUsers(filters),
    ]);
    const data = {
      users,
      page,
      limit,
      total,
      warnings,
    };
    return successResponse(res, data, 'Usuarios listados correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al obtener usuarios', 500, errorMessage);
  }
}

export const logicalRemove = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const result = await userService.logicalRemove(userId);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const { email } = verifyEmailToken(token as string);
    await userService.verifyEmail(email);
    return res.json({ success: true, message: 'Email verificado correctamente' });
  } catch {
    return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
  }
};


