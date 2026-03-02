import { Request, Response, NextFunction } from 'express';
import { getNotificationsQuerySchema } from './notification.validation';
import * as NotificationService from './notification.service';
import { AppError } from '@/utils/AppError';

export const getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const subscriptionId = req.subscriptionId;

        if (!subscriptionId) {
            throw new AppError('No se encontró el contexto de suscripción del usuario', 400);
        }

        const { query } = getNotificationsQuerySchema.parse({ query: req.query });
        const notifications = await NotificationService.getNotifications(subscriptionId, query);

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
};

export const getUnreadCount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const subscriptionId = req.subscriptionId;

        if (!subscriptionId) {
            throw new AppError('No se encontró el contexto de suscripción del usuario', 400);
        }

        const count = await NotificationService.getUnreadCount(subscriptionId);

        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const subscriptionId = req.subscriptionId;
        const { id } = req.params;

        if (!subscriptionId) {
            throw new AppError('No se encontró el contexto de suscripción del usuario', 400);
        }

        const updatedNotification = await NotificationService.markAsRead(id, subscriptionId);

        res.status(200).json({
            success: true,
            data: updatedNotification,
        });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const subscriptionId = req.subscriptionId;

        if (!subscriptionId) {
            throw new AppError('No se encontró el contexto de suscripción del usuario', 400);
        }

        await NotificationService.markAllAsRead(subscriptionId);

        res.status(200).json({
            success: true,
            message: 'Todas las notificaciones marcadas como leídas',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const subscriptionId = req.subscriptionId;
        const { id } = req.params;

        if (!subscriptionId) {
            throw new AppError('No se encontró el contexto de suscripción del usuario', 400);
        }

        await NotificationService.deleteNotification(id, subscriptionId);

        res.status(200).json({
            success: true,
            message: 'Notificación eliminada',
        });
    } catch (error) {
        next(error);
    }
};
