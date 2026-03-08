import prisma from '@/config/database';
import { GetNotificationsQuery } from './notification.validation';
import { Prisma, NotificationType } from '@prisma/client';
import { redis } from '@/shared/services/redis.service';
import { logger } from '@/utils/logger';
import { buildPagination } from '@/utils/query-filter';

// Helper for cache keys
export const getListCacheKey = (subscriptionId: string, query: any) =>
    redis.generateDeterministicKey(`notifications:${subscriptionId}:list`, query);

export const getUnreadCacheKey = (subscriptionId: string) =>
    `notifications:${subscriptionId}:unreadCount`;

export const getNotifications = async (
    subscriptionId: string,
    query: GetNotificationsQuery
) => {
    // Cache key generation uses deterministic helper
    const cacheKey = getListCacheKey(subscriptionId, query);

    // 1. Try to get from cache
    const cached = await redis.get<any>(cacheKey);
    if (cached) {
        logger.info(`[NotificationService] Cache HIT for list: ${cacheKey}`);
        return cached;
    }

    const where: Prisma.NotificationWhereInput = {
        subscriptionId,
        isDeleted: false,
    };

    if (query.type) {
        where.type = query.type as NotificationType;
    }

    if (query.read !== undefined) {
        where.read = query.read;
    }

    // Use global pagination utility
    const { skip, take, page, limit } = buildPagination(query);

    const [total, notifications] = await Promise.all([
        prisma.notification.count({ where }),
        prisma.notification.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    const result = {
        items: notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };

    // 2. Set cache (TTL 5 mins)
    await redis.set(cacheKey, result, 300);
    logger.info(`[NotificationService] Cache SET for list: ${cacheKey}`);

    return result;
};

export const getUnreadCount = async (subscriptionId: string) => {
    const cacheKey = getUnreadCacheKey(subscriptionId);

    const cached = await redis.get<number>(cacheKey);
    if (cached !== null) {
        return cached;
    }

    const count = await prisma.notification.count({
        where: {
            subscriptionId,
            read: false,
            isDeleted: false
        }
    });

    await redis.set(cacheKey, count, 300);
    return count;
};

export const markAsRead = async (id: string, subscriptionId: string) => {
    // Ensure the notification belongs to the subscription
    const notification = await prisma.notification.findFirst({
        where: { id, subscriptionId },
    });

    if (!notification) {
        throw new Error('Notificación no encontrada o no pertenece a esta suscripción');
    }

    const result = await prisma.notification.update({
        where: { id },
        data: { read: true },
    });

    // Invalidate cache
    await redis.deleteKeysByPrefix(`notifications:${subscriptionId}:`);
    return result;
};

export const markAllAsRead = async (subscriptionId: string) => {
    const result = await prisma.notification.updateMany({
        where: { subscriptionId, read: false },
        data: { read: true },
    });

    await redis.deleteKeysByPrefix(`notifications:${subscriptionId}:`);
    return result;
};

export const deleteNotification = async (id: string, subscriptionId: string) => {
    // Ensure the notification belongs to the subscription
    const notification = await prisma.notification.findFirst({
        where: { id, subscriptionId },
    });

    if (!notification) {
        throw new Error('Notificación no encontrada o no pertenece a esta suscripción');
    }

    // Soft delete
    const result = await prisma.notification.update({
        where: { id },
        data: { isDeleted: true },
    });

    await redis.deleteKeysByPrefix(`notifications:${subscriptionId}:`);
    return result;
};
