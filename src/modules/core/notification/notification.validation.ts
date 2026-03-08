import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const notificationIdSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'ID de notificación inválido' }),
    }),
});

export const getNotificationsQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
        type: z.nativeEnum(NotificationType).optional(),
        read: z.enum(['true', 'false']).optional().transform((val) => {
            if (val === 'true') return true;
            if (val === 'false') return false;
            return undefined;
        }),
    }),
});

export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>['query'];
