// src/core/user/user.controller.ts
import { Request, Response } from 'express';
import { userService } from './user.service';
import { createUserSchema, updateMeSchema } from './user.validation';
import { buildPrismaFilters,buildPagination } from '@/utils/query-filter';
import { successResponse, errorResponse } from '@/utils/response';

import { generateEmailToken,verifyEmailToken } from '@/utils/token-email';
import { sendEmailVerification } from '@/utils/mailer';

import { redis } from '@/shared/services/redis.service';

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
      role: String
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
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string 
 *     responses:
 *       200:
 *         description: Usuario creado correctamente
 *       500:
 *         description: Error al crear usuario
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const data = createUserSchema.parse(req.body);
    const result: Awaited<ReturnType<typeof userService.createUser>> = await userService.createUser(data);
    const token = generateEmailToken(result.email);
    const sendEmail = await sendEmailVerification(result.email, token);
    console.log('Email enviado:', sendEmail);
    return successResponse(res, result,'Usuario creado correctamente');
  } catch (error) {
   const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al crear usuario', 500, errorMessage);
  }
};
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Users]
 *     responses:
 *      200:
 *        description: Perfil del usuario obtenido correctamente
 *      500:
 *        description: Error al obtener perfil del usuario
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await userService.getProfile(userId);
    return successResponse(res, user,'Perfil del usuario obtenido correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al obterner perfil del usuario', 500, errorMessage);
  }
};

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Actualizar datos del BP (persona, empresa) autenticado
 *     tags: [Users]
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
    await redis.deleteKeysByPrefix('users:');
    return successResponse(res, result,'Usuario actualizado');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al actualizar usuario', 500, errorMessage);
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
 *      200:
 *        description: Usuario eliminado correctamente
 *      500:
 *        description: Error al eliminar usuario
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const result = await userService.deleteUser(userId);
    await redis.deleteKeysByPrefix('users:');
    return successResponse(res, result, 'Usuario eliminado correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al eliminar usuario', 500, errorMessage);
  }
};

/**
 * @swagger
 * /users/activate/{id}:
 *   patch:
 *     summary: Activar usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario activado correctamente
 *       403:
 *         description: No autorizado para activar usuarios
 *       500:
 *         description: Error al activar usuario
 */
export const activateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const requester = req.user;
    console.log('Activando usuario:', userId, 'por', requester);
    if (!['admin', 'soporte'].includes(requester.role)) {
      return res.status(403).json({ message: 'No autorizado para activar usuarios' });
    }
    const result = await userService.activateUser(userId);
    return successResponse(res, result, 'Usuario activado correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al activar usuario', 500, errorMessage);
  }
};

/**
 * @swagger
 * /users/unlock/{id}:
 *   patch:
 *     summary: Desbloquear usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario desbloqueado correctamente
 *       403:
 *         description: No autorizado para desbloquear usuarios
 *       500:
 *         description: Error al desbloquear usuario
 */

export const unlockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const requester = req.user;
    if (!['admin', 'soporte'].includes(requester.role)) {
     return errorResponse(res, 'No autorizado para desbloquear usuarios', 403);
    }
    const result = await userService.unlockUser(userId);
    return successResponse(res, result, 'Usuario desbloqueado correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al desbloquear usuario', 500, errorMessage);
  }
}

/** * @swagger
 * /users/sessions:
 *    get:
 *     summary: Obtener todas las sesiones de usuario
 *     tags: [Sessions]
 *    responses:
 *      200:
 *        description: Sesiones obtenidas correctamente
 *      403:
 *        description: No autorizado para ver sesiones
 *      500:
 *        description: Error al obtener sesiones
 */

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    console.log('Obteniendo sesiones con filtros:', req.query);
    const requester = req.user;
    const filters: Record<string, unknown> = buildPrismaFilters(req.query);
    const { skip, take, page, limit,warnings  } = buildPagination(req.query);
    const cacheKey = `sessions:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
     console.log('Obteniendo sesiones con filtros:', filters, 'skip:', skip, 'take:', take);
    if (cached) {
      return successResponse(res, JSON.parse(cached), 'Sesiones cacheadas');
    }
   
    const [sessions, total] = await Promise.all([
      userService.getAllSessions(filters, skip, take),
      userService.countSessions(filters),
    ]);
     const data = {
      sessions,
      page,
      limit,
      total,
      warnings,
    };
    if (!['admin', 'soporte'].includes(requester.role)) {
      return res.status(403).json({ message: 'No autorizado para ver sesiones' });
    }
    return successResponse(res, data, 'Sesiones obtenidas correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al listar sesiones', 500, errorMessage);
  } 
}

/**
 * @swagger
  * /users/sessions/{id}:
  *  delete:
  *   summary: Eliminar sesión de usuario por ID
  *   tags: [Sessions]
  *   parameters:
  *     - in: path
  *       name: id
  *       required: true
  *       schema:
  *         type: string
  *   responses:
  *     200: 
  *      description: Sesión eliminada correctamente
  *     403:
  *      description: No autorizado para eliminar sesiones
  *     500:
  *      description: Error al eliminar sesión
 */

export const deleteSessionUser = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const requester = req;
    console.log('Eliminando sesión:', sessionId, 'por', requester.sessionId);
    if (!['admin', 'soporte'].includes(requester.user.role)) {
      return res.status(403).json({ message: 'No autorizado para eliminar sesiones' });
    }
    const result = await userService.deleteSession(sessionId, requester.sessionId);
    return successResponse(res, result, 'Sesión eliminada correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al eliminar sesión', 500, errorMessage);
  }
}

/**
 * @swagger
 * /users/sessions:
 *   delete:
 *     summary: Eliminar todas las sesiones diferentes al autenticado
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: Sesiones de usuario eliminadas correctamente
 *       403:
 *        description: No autorizado para eliminar sesiones de usuarios
 *       500:
 *        description: Error al eliminar sesiones de usuario
 */ 

export const deleteAllSessions = async (req: Request, res: Response) => {
  try {
    const requester = req.user;
    const sessionId = (req as any).sessionId;
    if (!['admin', 'soporte'].includes(requester.role)) {
      return res.status(403).json({ message: 'No autorizado para eliminar sesiones de usuarios' });
    }
    const result = await userService.deleteUserSessions(sessionId);
     return successResponse(res, result, 'Sesiones de usuario eliminadas correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al eliminar sesiones', 500, errorMessage);
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
 *         description: Lista de usuarios obtenida correctamente
 *       500:
 *       description: Error al obtener lista de usuarios
 */
export const filterUsers = async (req: Request, res: Response) => {
  try {
    const filters = buildPrismaFilters(req.query);
    const { skip, take, page, limit,warnings  } = buildPagination(req.query);
    const filtersRemovePageLimit = { ...filters };
    delete filtersRemovePageLimit.page;
    delete filtersRemovePageLimit.limit;

    const cacheKey = `users:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return successResponse(res, JSON.parse(cached), 'Usuarios cacheados');
    }
    const [users,total ] = await Promise.all([
      userService.getUsers(filtersRemovePageLimit, skip, take),
      userService.countUsers(filtersRemovePageLimit),
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
/** * @swagger
 * /users/{id}:
 *    get:
 *      summary: Obtener usuario por ID
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *       200:
 *        description: Usuario encontrado correctamente
 *       404:
 *        description: Usuario no encontrado
 */

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user || user.isDeleted)  return errorResponse(res, 'Usuario no encontrado', 404, 'Usuario no encontrado');
    return successResponse(res, user, 'Usuario encontrado correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al buscar usuario', 500, errorMessage);
  }
};

/**
 * @swagger
 * /users/logicalRemove/{id}:
 *    get:
 *      summary: Eliminar lógicamente un usuario por ID
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Usuario eliminado lógicamente correctamente
 *        500:
 *         description: Error al eliminar lógicamente el usuario
 *    
 */

export const logicalRemove = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const result = await userService.logicalRemove(userId);
    return successResponse(res, result, 'Usuario eliminado lógicamente correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al eliminar lógicamente el usuario', 500, errorMessage);
  }
}

/** * @swagger
 * /users/verify-email: 
 *    get:
 *      summary: Verificar correo electrónico del usuario
 *      tags: [Users]
 *      parameters:
 *        - in: query
 *          name: token
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Correo electrónico verificado correctamente
 *        400:
 *          description: Token inválido o expirado 
 */

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const { email } = verifyEmailToken(token as string);
    const result = await userService.verifyEmail(email);
    return successResponse(res, result, 'Email verificado correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Token inválido o expirado', 400, errorMessage);
  }
};


