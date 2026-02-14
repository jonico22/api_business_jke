import 'newrelic';

// Configurar zona horaria antes de cualquier operación de fecha
process.env.TZ = process.env.TZ || 'America/Lima';

import express from 'express';
import cors from 'cors';
// import routes from './routes'; // Moved to dynamic import
import { createDefaultRoles } from './utils/create-roles';
import { createInitialAdmin } from './utils/create-admin';
import requestLogger from './middlewares/logger.middleware';
import { logger } from './utils/logger';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from '@/middlewares/error.middleware';
import { connectRedis, redis } from '@/shared/services/redis.service';
import cookieParser from 'cookie-parser';
import { corsOptions } from '@/config/cors';
import { setupRateLimiter } from '@/config/rateLimit';
import helmet from 'helmet'; // Added import for helmet
import hpp from 'hpp'; // Added import for hpp
import http from 'http'; // Added import for http
import prisma from '@/config/database';
import { initSocketHub } from '@/services/socket-hub';

// Helper function to initialize data and services
async function initializeDataAndServices() {
  await createDefaultRoles();
  await createInitialAdmin();
}

async function main() {
  await initializeDataAndServices();
  await connectRedis();

  const port = process.env.PORT || 4000;
  const app = express();
  const server = http.createServer(app);
  await initSocketHub(server);

  app.use(requestLogger);

  // 1. SEGURIDAD INICIAL: Helmet y CORS primero
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors(corsOptions));

  // 2. RATE LIMITER: Se mueve a routes/index.ts para manejo granular (skip cache)
  // app.use('/api', setupRateLimiter());

  app.use(cookieParser());
  app.use(express.json());

  // 4. PARAMETER POLLUTION: Limpiamos los query strings
  app.use(hpp({
    whitelist: ['user']
  }));
  app.get('/health', async (req, res) => {
    try {
      // 1. Verificar Base de Datos (Prisma)
      await prisma.$queryRaw`SELECT 1`;

      // 2. Verificar Redis
      // Si usas el cliente que configuramos:
      const redisHealthy = await redis.ping();
      res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          redis: redisHealthy ? 'connected' : 'disconnected'
        }
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // app.use(requestLogger); // Moved up
  // Importar rutas dinámicamente DESPUÉS de conectar a Redis
  // Esto previene que el RateLimiter intente conectar antes de tiempo
  const routes = (await import('./routes')).default;
  app.use('/api', routes);
  app.get('/', (_req, res) => res.send('API activa test probando'));
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Ruta no encontrada',
      path: req.originalUrl,
    });
  });
  app.use(errorHandler);
  //app.listen(port, () => console.log(`🚀 Servidor en el http://localhost:${port}`));
  // 5. Escuchar explícitamente en 0.0.0.0
  server.listen(Number(port), '0.0.0.0', () => {
    logger.info(`🚀 Servidor listo y escuchando en puerto ${port}`);
  });
}

// 4. Llama a la función main y maneja el error globalmente
main().catch((err) => {
  logger.error(`Error fatal al iniciar la aplicación: ${err.message}`, err);
  process.exit(1);
});

