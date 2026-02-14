import { Request, Response, NextFunction } from 'express';
import { redis } from '@/shared/services/redis.service';
import { logger } from '@/utils/logger';
import { getListCacheKey, getUnreadCacheKey } from './notification.service';
import { getNotificationsQuerySchema } from './notification.validation';

export const checkListCache = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscriptionId = req.societyId;
        if (!subscriptionId) return next();

        // Validate/Clean query to match service logic exactly
        const queryResult = getNotificationsQuerySchema.safeParse({ query: req.query });
        if (!queryResult.success) return next(); // Let controller handle validation error

        const query = queryResult.data.query;
        const cacheKey = getListCacheKey(subscriptionId, query);

        const cached = await redis.get(cacheKey);
        if (cached) {
            logger.info(`[NotificationMiddleware] Cache HIT (Middleware): ${cacheKey}`);
            return res.status(200).json({
                success: true,
                data: cached
            });
        }
        next();
    } catch (error) {
        logger.error('[NotificationMiddleware] Error checking list cache:', error);
        next();
    }
};

export const checkUnreadCache = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscriptionId = req.societyId;
        if (!subscriptionId) return next();

        const cacheKey = getUnreadCacheKey(subscriptionId);

        const cached = await redis.get(cacheKey);
        if (cached !== null) {
            logger.info(`[NotificationMiddleware] Cache HIT (Middleware): ${cacheKey}`);
            return res.status(200).json({
                success: true,
                data: { count: cached }
            });
        }
        next();
    } catch (error) {
        logger.error('[NotificationMiddleware] Error checking unread cache:', error);
        next();
    }
};
