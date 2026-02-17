import prisma from '@/config/database';
import { GetNotificationsQuery } from './notification.validation';
import { Prisma, NotificationType } from '@prisma/client';
import { redis } from '@/shared/services/redis.service';
import { logger } from '@/utils/logger';

// Helper for cache keys
export const getListCacheKey = (subscriptionId: string, query: any) =>
    `notifications:${subscriptionId}:list:${JSON.stringify(query)}`;

export const getUnreadCacheKey = (subscriptionId: string) =>
    `notifications:${subscriptionId}:unreadCount`;

// Helper to resolve subscription ID (UUID) from Context ID (Society Code or UUID)
const resolveSubscriptionId = async (id: string): Promise<string> => {
    // Basic UUID check
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) return id;

    // It's likely a societyId (SOC-...)
    const sub = await prisma.subscription.findUnique({
        where: { societyId: id },
        select: { id: true }
    });

    if (!sub) {
        logger.warn(`[NotificationService] No subscription found for societyId: ${id}`);
        // Return original to let Prisma fail naturally or return empty
        return id;
    }
    return sub.id;
};

export const getNotifications = async (
    subscriptionId: string,
    query: GetNotificationsQuery
) => {
    const { page, limit, type, read } = query;
    // Cache key generation uses the ORIGINAL identifier (req.societyId) to match Middleware
    const cacheKey = getListCacheKey(subscriptionId, query);

    // 1. Try to get from cache
    const cached = await redis.get<any>(cacheKey);
    if (cached) {
        logger.info(`[NotificationService] Cache HIT for list: ${cacheKey}`);
        return cached;
    }

    // Resolve real UUID for DB query
    const dbSubscriptionId = await resolveSubscriptionId(subscriptionId);

    const where: Prisma.NotificationWhereInput = {
        subscriptionId: dbSubscriptionId,
        isDeleted: false,
    };

    if (type) {
        where.type = type as NotificationType;
    }

    if (read !== undefined) {
        where.read = read;
    }

    const [total, notifications] = await Promise.all([
        prisma.notification.count({ where }),
        prisma.notification.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
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

    const dbSubscriptionId = await resolveSubscriptionId(subscriptionId);

    const count = await prisma.notification.count({
        where: {
            subscriptionId: dbSubscriptionId,
            read: false,
            isDeleted: false
        }
    });

    await redis.set(cacheKey, count, 300);
    return count;
};

export const markAsRead = async (id: string, subscriptionId: string) => {
    // Resolve UUID for DB
    const dbSubscriptionId = await resolveSubscriptionId(subscriptionId);

    // Ensure the notification belongs to the subscription (using UUID)
    const notification = await prisma.notification.findFirst({
        where: { id, subscriptionId: dbSubscriptionId },
    });

    if (!notification) {
        throw new Error('Notificación no encontrada o no pertenece a esta suscripción');
    }

    const result = await prisma.notification.update({
        where: { id },
        data: { read: true },
    });

    // Invalidate cache using ORIGINAL subscriptionId (SOC code)
    await redis.deleteKeysByPrefix(`notifications:${subscriptionId}:`);
    return result;
};

export const markAllAsRead = async (subscriptionId: string) => {
    const dbSubscriptionId = await resolveSubscriptionId(subscriptionId);

    const result = await prisma.notification.updateMany({
        where: { subscriptionId: dbSubscriptionId, read: false },
        data: { read: true },
    });

    await redis.deleteKeysByPrefix(`notifications:${subscriptionId}:`);
    return result;
};

export const deleteNotification = async (id: string, subscriptionId: string) => {
    const dbSubscriptionId = await resolveSubscriptionId(subscriptionId);

    // Ensure the notification belongs to the subscription
    const notification = await prisma.notification.findFirst({
        where: { id, subscriptionId: dbSubscriptionId },
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
