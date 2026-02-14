import { Router } from 'express';
import * as NotificationController from './notification.controller';
import { validateId } from '../../../middlewares/validation.middleware';
import auth from '../../../middlewares/auth.middleware';
import { notificationIdSchema } from './notification.validation';
import { setupRateLimiter } from '@/config/rateLimit';
import { checkListCache, checkUnreadCache } from './notification.middleware';

const router = Router();
const limiter = setupRateLimiter(); // Use default config from rateLimit.ts

router.use(auth);

// GET routes: Check cache first, then LIMIT, then Controller
router.get('/', checkListCache, limiter, NotificationController.getNotifications);
router.get('/unread-count', checkUnreadCache, limiter, NotificationController.getUnreadCount);

// Modification routes: Always limit
router.patch('/mark-all-read', limiter, NotificationController.markAllAsRead);

router.patch(
    '/:id/read',
    validateId(notificationIdSchema),
    limiter,
    NotificationController.markAsRead
);

router.delete(
    '/:id',
    validateId(notificationIdSchema),
    limiter,
    NotificationController.deleteNotification
);

export default router;
