// src/core/user/user.controller.ts
import { Request, Response } from 'express';
import { userService } from './user.service';
import { createUserSchema, updateMeSchema, createBusinessUserSchema, updateBusinessUserSchema } from './user.validation';
import prisma from '@/config/database';
import { buildPrismaFilters, buildPagination } from '@/utils/query-filter';
import { successResponse, errorResponse } from '@/utils/response';

import { generateEmailToken, verifyEmailToken } from '@/utils/token-email';
import { sendEmailVerification, sendWelcomeEmail } from '@/utils/mailer';
import { generateRandomPassword } from '@/utils/hash';

import { redis } from '@/shared/services/redis.service';
import { requestApiSalePut } from '@/services/api-sales.service';


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

    return successResponse(res, result, 'Usuario creado correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al crear usuario', 500, errorMessage);
  }
};

/**
 * @swagger
 * /users/business:
 *   post:
 *     summary: Crear nuevo usuario para un negocio (Solo OWNER o ADMIN) verificando límites del plan
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
 *               firstName:
 *                 type: string
 *               phone:
 *                 type: string
 *               roleCode:
 *                 type: string 
 *     responses:
 *       200:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Límite excedido o datos inválidos
 *       500:
 *         description: Error interno
 */
export const createBusinessUser = async (req: Request, res: Response) => {
  try {
    const data = createBusinessUserSchema.parse(req.body);
    const societyId = req.societyId;
    const subscriptionId = req.subscriptionId;

    if (!societyId || !subscriptionId) {
      return errorResponse(res, 'No tienes una sociedad o suscripción asignada', 400);
    }

    // 1. Obtener la suscripción y su plan (maxUsers)
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return errorResponse(res, 'Suscripción no válida o inactiva', 400);
    }

    const maxUsers = subscription.plan.maxUsers;

    // 2. Contar usuarios actuales autorizados
    const currentUsers = await prisma.authorizedUserSubscription.count({
      where: { subscriptionId: subscriptionId }
    });

    // Validar límite (currentUsers representan los empleados ocupando asientos, si owner NO está en authorized, 
    // debes reservar +1 asiento, o verificar si currentUsers + 1 (el nuevo) >= maxUsers)
    if (currentUsers >= maxUsers) {
      return errorResponse(res, `Límite de usuarios (${maxUsers}) alcanzado para el plan ${subscription.plan.name}`, 403);
    }

    // 3. Obtener o crear el Rol personalizado para este negocio (ej: SELLER-SOC-123)
    let userRole = await prisma.role.findFirst({
      where: { code: `${data.roleCode}-${societyId}` }
    });

    if (!userRole) {
      const baseRole = await prisma.role.findUnique({ where: { code: data.roleCode } });
      if (!baseRole) return errorResponse(res, 'Código de rol base no existe (ej: SELLER, STOCK_MANAGER)', 400);
      userRole = await prisma.role.create({
        data: {
          code: `${data.roleCode}-${societyId}`,
          name: baseRole.name,
          societyId: societyId
        }
      });
    }

    // 4. Crear el usuario delegando en userService
    const newPassword = data.password || generateRandomPassword();
    const mockData = {
      email: data.email,
      password: newPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: userRole.code,
      isBusiness: false,
      typeBP: 'PERSONA'
    };

    const newUser = await userService.createUser(mockData);

    // 5. Vincular a la suscripción
    await prisma.authorizedUserSubscription.create({
      data: {
        userId: newUser.id,
        subscriptionId: subscriptionId
      }
    });

    // 6. Notificar por email las credenciales
    await sendWelcomeEmail(data.email, data.firstName, data.lastName, data.email, newPassword);

    // 7. Sincronizar recuento de usuarios a Ventas
    try {
      const totalUsers = await prisma.authorizedUserSubscription.count({
        where: { subscriptionId }
      });
      await requestApiSalePut(`societies/${societyId}`, { totalUsers });
    } catch (syncError) {
      console.error('Error sincronizando totalUsers a Ventas tras creación:', syncError);
      // Operación no crítica en el momento, no cortamos el flujo
    }

    return successResponse(res, newUser, 'Usuario de negocio creado correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al crear usuario de negocio', 500, errorMessage);
  }
};

/**
 * @swagger
 * /users/business:
 *   get:
 *     summary: Listar todos los usuarios asociados al negocio (Solo OWNER o ADMIN)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios del negocio
 *       400:
 *         description: No tienes una sociedad o suscripción asignada
 *       500:
 *         description: Error interno
 */
export const getBusinessUsers = async (req: Request, res: Response) => {
  try {
    const subscriptionId = req.subscriptionId;

    if (!subscriptionId) {
      return errorResponse(res, 'No tienes una sociedad o suscripción asignada', 400);
    }

    const authorizedUsers = await prisma.authorizedUserSubscription.findMany({
      where: {
        subscriptionId: subscriptionId,
        user: {
          role: {
            code: {
              not: 'OWNER'
            }
          }
        }
      },
      include: {
        user: {
          include: {
            role: true,
            person: true,
            sessions: {
              orderBy: { createdAt: 'desc' },
              take: 1, // Traer solo la sesión más reciente
              select: {
                createdAt: true // Fecha de inicio de sesión
              }
            }
          }
        }
      },
      orderBy: { authorizedAt: 'asc' }
    });

    // Mapeamos para devolver un arreglo limpio de usuarios
    const users = authorizedUsers.map(auth => {
      const userObj = auth.user;
      return {
        ...userObj,
        lastLogin: userObj.sessions.length > 0 ? userObj.sessions[0].createdAt : null,
        sessions: undefined // Removemos el arreglo crudo
      };
    });

    return successResponse(res, users, 'Usuarios del negocio obtenidos correctamente');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al obtener usuarios de negocio', 500, errorMessage);
  }
};

/**
 * @swagger
 * /users/business/{id}/toggle-status:
 *   patch:
 *     summary: Activa o desactiva (Suspende) un empleado del negocio
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado
 *       403:
 *         description: El usuario no pertenece a este negocio
 *       500:
 *         description: Error interno
 */
export const toggleBusinessUserStatus = async (req: Request, res: Response) => {
  try {
    const subscriptionId = req.subscriptionId;
    const { id: targetUserId } = req.params;

    if (!subscriptionId) {
      return errorResponse(res, 'No tienes una sociedad o suscripción asignada', 400);
    }

    // 1. Validar que el usuario objetivo realmente pertenezca a la suscripción de quien está pidiendo el cambio
    const authorizedLink = await prisma.authorizedUserSubscription.findFirst({
      where: {
        userId: targetUserId,
        subscriptionId: subscriptionId
      },
      include: { user: true }
    });

    if (!authorizedLink) {
      return errorResponse(res, 'Este usuario no pertenece a tu negocio', 403);
    }

    // 2. No permitir que el Owner se auto-desactive aquí (opcional pero buena práctica)
    if (authorizedLink.user.roleId === req.user?.roleId) {
      // o si el targetUserId === req.user.id
      if (targetUserId === req.user?.id) {
        return errorResponse(res, 'No puedes desactivar tu propia cuenta desde este módulo', 400);
      }
    }

    // 3. Modificar el estado (toggle)
    const newStatus = !authorizedLink.user.isActive;
    await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: newStatus }
    });

    // 4. Invalida la sesión (si lo desactivaron para botarlo del sistema de inmediato)
    if (!newStatus) {
      await prisma.session.deleteMany({ where: { userId: targetUserId } });
    }

    return successResponse(res, { isActive: newStatus }, `El acceso del usuario a la plataforma ha sido ${newStatus ? 'activado' : 'suspendido'}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al cambiar estado del empleado', 500, errorMessage);
  }
};

/**
 * @swagger
 * /users/business/{id}:
 *   delete:
 *     summary: Eliminar permanentemente un empleado del negocio
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       403:
 *         description: El usuario no pertenece a este negocio
 *       500:
 *         description: Error interno
 */
export const removeBusinessUser = async (req: Request, res: Response) => {
  try {
    const subscriptionId = req.subscriptionId;
    const { id: targetUserId } = req.params;

    if (!subscriptionId) {
      return errorResponse(res, 'No tienes una sociedad o suscripción asignada', 400);
    }

    // 1. Validar que el usuario objetivo realmente pertenezca a la suscripción de quien está pidiendo el cambio
    const authorizedLink = await prisma.authorizedUserSubscription.findFirst({
      where: {
        userId: targetUserId,
        subscriptionId: subscriptionId
      },
      include: { user: true }
    });

    if (!authorizedLink) {
      return errorResponse(res, 'Este usuario no pertenece a tu negocio', 403);
    }

    // 2. Proteger al OWNER contra auto-eliminación
    if (authorizedLink.user.roleId === req.user?.roleId || targetUserId === req.user?.id) {
      return errorResponse(res, 'No puedes eliminar tu propia cuenta de Dueño/Administrador desde este submódulo', 400);
    }

    // 3. Eliminar dependencias
    await prisma.authorizedUserSubscription.deleteMany({ where: { userId: targetUserId } });
    await prisma.userViewPermission.deleteMany({ where: { userId: targetUserId } });

    // 4. Delegar la eliminación final al user.service
    await userService.deleteUser(targetUserId);

    // 5. Sincronizar recuento de usuarios con Ventas
    try {
      // Necesitamos el societyId de esta subscripción.
      // Ya que no lo tenemos desde req.societyId explícitamente en remoción,
      // lo podemos sacar de la suscripción, porque authorizeLink tiene la subscripción vinculada o
      // también a través de la DB de suscripciones.
      const sub = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        select: { societyId: true }
      });
      if (sub && sub.societyId) {
        const totalUsers = await prisma.authorizedUserSubscription.count({
          where: { subscriptionId }
        });
        await requestApiSalePut(`societies/${sub.societyId}`, { totalUsers });
      }
    } catch (syncError) {
      console.error('Error sincronizando totalUsers a Ventas tras eliminación:', syncError);
    }

    return successResponse(res, null, 'Usuario eliminado del negocio permanentemente');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al eliminar empleado', 500, errorMessage);
  }
};

/**
 * @swagger
 * /users/business/{id}:
 *   put:
 *     summary: Editar datos básicos y/o rol de un empleado del negocio
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
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               roleCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno
 */
export const updateBusinessUser = async (req: Request, res: Response) => {
  try {
    const subscriptionId = req.subscriptionId;
    const societyId = req.societyId;
    const { id: targetUserId } = req.params;

    if (!subscriptionId || !societyId) {
      return errorResponse(res, 'No tienes una sociedad o suscripción asignada', 400);
    }

    const data = updateBusinessUserSchema.parse(req.body);

    // 1. Validar que pertenece al negocio actual
    const authorizedLink = await prisma.authorizedUserSubscription.findFirst({
      where: {
        userId: targetUserId,
        subscriptionId: subscriptionId
      },
      include: { user: true }
    });

    if (!authorizedLink) {
      return errorResponse(res, 'Este usuario no pertenece a tu negocio', 403);
    }

    // 2. Proteger al OWNER contra auto-edición en este submódulo
    if (authorizedLink.user.roleId === req.user?.roleId || targetUserId === req.user?.id) {
      return errorResponse(res, 'Debes usar tu Perfil para editar tus propios datos.', 400);
    }

    // 3. Procesar Cambio de Rol si lo enviaron
    let newRoleId: string | undefined = undefined;
    if (data.roleCode) {
      let userRole = await prisma.role.findFirst({
        where: { code: `${data.roleCode}-${societyId}` }
      });

      if (!userRole) {
        const baseRole = await prisma.role.findUnique({ where: { code: data.roleCode } });
        if (!baseRole) return errorResponse(res, 'Código de rol base no existe', 400);
        userRole = await prisma.role.create({
          data: {
            code: `${data.roleCode}-${societyId}`,
            name: baseRole.name,
            societyId: societyId
          }
        });
      }
      newRoleId = userRole.id;
    }

    // 4. Actualizar tabla Person 
    const personUpdateData: any = {};
    if (data.firstName) personUpdateData.firstName = data.firstName;
    if (data.lastName) personUpdateData.lastName = data.lastName;
    if (data.phone !== undefined) personUpdateData.phone = data.phone;

    const dbTransactions = [];

    if (Object.keys(personUpdateData).length > 0) {
      dbTransactions.push(
        prisma.bussinessPartner.update({
          where: { userId: targetUserId },
          data: personUpdateData
        })
      );
    }

    // Si cambió el Rol 
    if (newRoleId && authorizedLink.user.roleId !== newRoleId) {
      dbTransactions.push(
        prisma.user.update({
          where: { id: targetUserId },
          data: { roleId: newRoleId }
        })
      );
      // Tumbar sesiones para forzar los nuevos permisos
      dbTransactions.push(
        prisma.session.deleteMany({ where: { userId: targetUserId } })
      );
    }

    if (dbTransactions.length > 0) {
      await prisma.$transaction(dbTransactions);
    }

    return successResponse(res, null, 'Usuario de negocio actualizado correctamente');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al actualizar información del empleado', 500, errorMessage);
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
    return successResponse(res, user, 'Perfil del usuario obtenido correctamente');
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
    return successResponse(res, result, 'Usuario actualizado');
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
    const result = await userService.activateUser(userId);
    //const token = generateEmailToken(result.email);
    //await sendEmailVerification(result.email, token);
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
    const role = req.role as string;
    if (!['ADMIN', 'SUPPORT'].includes(role)) {
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

    const filters: Record<string, unknown> = buildPrismaFilters(req.query);
    const { skip, take, page, limit, warnings } = buildPagination(req.query);
    const cacheKey = `sessions:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    const role = req.role as string;
    if (cached) {
      return successResponse(res, JSON.parse(cached as string), 'Sesiones cacheadas');
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
    if (!['ADMIN', 'SUPPORT'].includes(role)) {
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
    const requesterSessionId = (req as any).sessionId;
    const role = req.role as string;
    if (!['admin', 'soporte'].includes(role)) {
    }
    const result = await userService.deleteSession(sessionId, requesterSessionId);
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
    const role = req.role as string;
    if (!['admin', 'soporte'].includes(role)) {
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
    const { skip, take, page, limit, warnings } = buildPagination(req.query);
    const filtersRemovePageLimit = { ...filters };
    delete filtersRemovePageLimit.page;
    delete filtersRemovePageLimit.limit;

    const cacheKey = `users:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return successResponse(res, JSON.parse(cached as string), 'Usuarios cacheados');
    }
    const [users, total] = await Promise.all([
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
    if (!user || user.isDeleted) return errorResponse(res, 'Usuario no encontrado', 404, 'Usuario no encontrado');
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

export const assignUserPermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // userId
    const { viewCode, permissions } = req.body; // array of permission names e.g ['READ', 'CREATE']
    const assignerId = req.user?.id;

    if (!viewCode || !Array.isArray(permissions)) {
      return errorResponse(res, 'Faltan datos obligatorios: viewCode o permissions (array)', 400);
    }

    const result = await userService.assignPermissionsToUser(id, viewCode, permissions, assignerId);
    return successResponse(res, result, 'Permisos especiales asignados');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error asignando permisos al usuario', 500, errorMessage);
  }
};
