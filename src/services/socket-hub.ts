import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import msgpackParser from "socket.io-msgpack-parser";
import prisma from "@/config/database";
import { NotificationType, NotificationPriority } from "@prisma/client";
import redisClient, { redis } from "@/shared/services/redis.service";
import { logger } from "@/utils/logger";

// Define Notification payload interface
interface NotificationPayload {
    businessId: string; // This maps to subscriptionId in our schema
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    link?: string;
    metadata?: any;
    read?: boolean;
    createdAt?: string;
    updatedAt?: string;
    subscriptionId?: string; // Optional if same as businessId
}

// Define Redis update payload interface
interface UpdatePayload {
    businessId: string;
    data: any;
}

// Define Message structure from Redis
interface RedisMessage {
    action: 'NOTIFY' | 'UPDATE_TABLE';
    businessId: string;
    data: any;
}

let io: Server;

export const initSocketHub = async (httpServer: any) => {
    // --- CONFIGURACIÓN REDIS ---
    // Usamos el cliente compartido como base para crear duplicados (necesario para pub/sub)
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate(); // Para adaptador interno de Socket.io
    const listenerClient = redisClient.duplicate(); // Para escuchar eventos personalizados de Ventas

    // Manejadores de error para evitar caídas de la app
    pubClient.on('error', (err) => logger.error('[SocketHub] Redis PubClient Error:', err));
    subClient.on('error', (err) => logger.error('[SocketHub] Redis SubClient Error:', err));
    listenerClient.on('error', (err) => logger.error('[SocketHub] Redis ListenerClient Error:', err));

    await Promise.all([pubClient.connect(), subClient.connect(), listenerClient.connect()]);

    // --- INICIALIZAR SOCKET.IO ---
    io = new Server(httpServer, {
        cors: { origin: "*" }, // Ajustar a dominio real en producción
        parser: msgpackParser, // Compresiónbinaria
        adapter: createAdapter(pubClient, subClient),
        pingInterval: 10000,
        pingTimeout: 5000
    });

    // Middleware para logs de depuración de conexiones
    io.use((socket, next) => {
        logger.info(`[SocketHub] Incoming connection attempt: ${socket.id}`);
        logger.info(`[SocketHub] Transport: ${socket.conn.transport.name}`);
        logger.info(`[SocketHub] Query: ${JSON.stringify(socket.handshake.query)}`);
        logger.info(`[SocketHub] Headers: ${JSON.stringify(socket.handshake.headers)}`);
        next();
    });

    io.on("connection", (socket: Socket) => {
        const { businessId } = socket.handshake.query;
        if (businessId) {
            // Unir al usuario al canal de su suscripción (businessId se asume como subscriptionId)
            socket.join(`business_${businessId}`);
            logger.info(`Usuario unido a: business_${businessId}`);

            // Confirmar al cliente que se unió correctamente
            socket.emit('connection_success', {
                message: `Conectado a sala: business_${businessId}`,
                room: `business_${businessId}`
            });
        }
    });

    // --- WORKER: ESCUCHAR EVENTOS DE API VENTAS ---
    logger.info("👂 Escuchando canal 'inter_api_events'...");


    await listenerClient.subscribe("inter_api_events", async (message: string) => {
        try {
            const payload: RedisMessage = JSON.parse(message);
            // payload = { action: 'NOTIFY' | 'UPDATE_TABLE', businessId, data }

            if (payload.action === 'NOTIFY') {
                const notifData = payload.data as NotificationPayload;
                logger.info(`🔔 Notificación recibida para business_${payload.businessId}: ${notifData.title}`);
                logger.info(`[SocketHub] Intentando resolver Subscription para businessId: ${payload.businessId}`);

                // Resolver Subscription ID
                // 1. Intentar buscar por societyId
                let targetSubscriptionId = payload.businessId;
                let targetSocietyId = payload.businessId; // Needed for Cache Invalidation

                try {
                    // El usuario confirma que payload.businessId ES el UUID de la suscripción
                    const subById = await prisma.subscription.findUnique({
                        where: { id: payload.businessId },
                        select: { id: true, societyId: true }
                    });

                    if (subById) {
                        targetSubscriptionId = subById.id; // UUID
                        targetSocietyId = subById.societyId; // SOC-... para caché
                        logger.info(`[SocketHub] Suscripción encontrada por UUID. SocietyId asociado: ${targetSocietyId}`);
                    } else {
                        logger.warn(`[SocketHub] NO se encontró suscripción con UUID: ${payload.businessId}. La creación podría fallar.`);
                        // Fallbacks en caso de error
                        targetSocietyId = payload.businessId;
                    }

                    const notifDB = await prisma.notification.create({
                        data: {
                            subscriptionId: targetSubscriptionId,
                            type: notifData.type,
                            title: notifData.title,
                            message: notifData.message,
                            priority: notifData.priority || NotificationPriority.MEDIUM,
                            link: notifData.link,
                            metadata: notifData.metadata
                        }
                    });
                    logger.info(`[SocketHub] Notificación guardada con ID: ${notifDB.id}`);

                    // Invalidate cache for this subscription
                    // CRITICAL: Invalidate using the Subscription UUID because that's what Notification Service uses for keys
                    await redis.deleteKeysByPrefix(`notifications:${targetSubscriptionId}:`);

                    // 2. Emitir a la Campana (usamos businessId para el room, asumiendo que el frontend se conecta con el mismo ID que enviamos)
                    // OJO: Si el frontend se conecta con societyId, debemos emitir a business_societyId
                    // Si el payload trae societyId, enviamos a ese.

                    // Emite a AMBOS rooms para asegurar que llegue ya sea por UUID o por Society code
                    io.to(`business_${payload.businessId}`).emit("ui_notification", notifDB);

                    if (targetSocietyId && targetSocietyId !== payload.businessId) {
                        logger.info(`[SocketHub] Emitiendo también a room secundario: business_${targetSocietyId}`);
                        io.to(`business_${targetSocietyId}`).emit("ui_notification", notifDB);
                    }

                } catch (err: any) {
                    logger.error(`[SocketHub] Error critico procesando NOTIFY: ${err.message}`, err);
                }
            }

            else if (payload.action === 'UPDATE_TABLE') {
                const resolvedBusinessId = payload.businessId || payload.data?.businessId || payload.data?.societyId;

                logger.info(`🔄 UPDATE_TABLE recibido. ID resuelto: ${resolvedBusinessId}`);

                if (!resolvedBusinessId) {
                    logger.warn(`[SocketHub] UPDATE_TABLE ignorado: No se pudo resolver un ID válido del payload.`);
                    console.error("===== ERROR PAYLOAD =====");
                    console.error(JSON.stringify(payload, null, 2));
                    console.error("=========================");
                    return;
                }

                try {
                    // Resolve Subscription ID to handle societyId fallback like NOTIFY does
                    let targetBusinessId = resolvedBusinessId;

                    // Only query Prisma if the derived businessId is exactly a 36-char UUID format
                    if (resolvedBusinessId.length === 36 && resolvedBusinessId.split('-').length === 5) {
                        const subById = await prisma.subscription.findUnique({
                            where: { id: resolvedBusinessId },
                            select: { id: true, societyId: true }
                        });

                        if (subById) {
                            targetBusinessId = subById.id;
                        }
                    }

                    // Emit to the primary resolved ID room
                    io.to(`business_${resolvedBusinessId}`).emit("ui_update_table", payload.data);

                    if (targetBusinessId && targetBusinessId !== resolvedBusinessId) {
                        logger.info(`[SocketHub] Emitiendo UPDATE_TABLE también a room secundario: business_${targetBusinessId}`);
                        io.to(`business_${targetBusinessId}`).emit("ui_update_table", payload.data);
                    }
                } catch (err: any) {
                    logger.error(`[SocketHub] Error critico procesando UPDATE_TABLE: ${err.message}`, err);
                }
            }

        } catch (err: any) {
            logger.error("Error procesando evento Redis:", err);
        }
    });

    return io;
};
