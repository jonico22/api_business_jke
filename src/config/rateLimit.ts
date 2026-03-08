import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
// Asegúrate de que este import traiga la INSTANCIA del servicio, no la clase
import client from '@/shared/services/redis.service';
import { AppError } from '@/utils/AppError';

export const setupRateLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5000, // Límite de 5000 peticiones (Aumentado para desarrollo)
    standardHeaders: true,
    legacyHeaders: false,

    // Configuración del Store de Redis
    store: new RedisStore({
      // Usamos el 'sendCommand' del cliente nativo de Redis
      sendCommand: (...args: string[]) => client.sendCommand(args),
    }),

    // Manejador de error personalizado
    handler: (req, res, next) => {
      next(new AppError('Demasiadas peticiones desde esta IP, por favor intente en 15 minutos', 429));
    },

    // Opcional: Saltar validación si no hay conexión a Redis para que la API no se caiga
    skip: (req) => !client?.isOpen,
  });
};