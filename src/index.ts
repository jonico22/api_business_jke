import 'newrelic';

import express from 'express';
import cors from 'cors';
import routes from './routes';
import { createDefaultRoles } from './utils/create-roles';
import { createInitialAdmin } from './utils/create-admin';
import requestLogger from './middlewares/logger.middleware';
import { logger } from './utils/logger';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from '@/middlewares/error.middleware';
import { connectRedis } from '@/shared/services/redis.service';
import cookieParser from 'cookie-parser';
import { corsOptions } from '@/config/cors';
import { getRateLimiter } from '@/config/rateLimit';
import { envs } from '@/config/envs';
import helmet from 'helmet';
import hpp from 'hpp';


async function initializeDataAndServices() {
    await createDefaultRoles();
    await createInitialAdmin();
    logger.info('roles, administrador inicial');
}

async function main() {
    await initializeDataAndServices(); 
    await connectRedis();
    const port = process.env.PORT || 4000;
    const app = express();

    // 1. SEGURIDAD INICIAL: Helmet y CORS primero
    app.use(helmet());
    app.use(cors(corsOptions));

    // 2. RATE LIMITER: Protege la API antes de gastar recursos procesando el JSON
    if (envs.isProd) {
      app.use('/api', getRateLimiter); 
    }
    app.use(cookieParser());
    app.use(express.json());

    // 4. PARAMETER POLLUTION: Limpiamos los query strings
    app.use(hpp({
      whitelist: ['user']
    }));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use(requestLogger);
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
    app.listen(Number(port), '0.0.0.0', () => {
        console.log(`🚀 Servidor listo y escuchando en puerto ${port}`);
    });
}

// 4. Llama a la función main y maneja el error globalmente
main().catch((err) => {
    logger.error(`Error fatal al iniciar la aplicación: ${err.message}`, err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`UNHANDLED REJECTION: ${reason}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
  process.exit(1);
});
