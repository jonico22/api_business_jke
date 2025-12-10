import express from 'express';
import cors from 'cors';
import routes from './routes';
import { createDefaultRoles } from './utils/create-roles';
import { createInitialAdmin } from './utils/create-admin';
import { createDocumentTypes} from './utils/create-type-doc';
import requestLogger from './middlewares/logger.middleware';
import { logger } from './utils/logger';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from '@/middlewares/error.middleware';
import { redis } from '@/shared/services/redis.service';
import cookieParser from 'cookie-parser';


console.log(`[APP DEBUG] Iniciando xsxs...`);


async function initializeDataAndServices() {
    // 1.1 Ejecuta la lógica asíncrona de creación de datos
    await createDefaultRoles();
    await createInitialAdmin();
    await createDocumentTypes();
    logger.info('roles, administrador inicial');

    // 1.2 Ejecuta la lógica de Redis
    if (redis.enabled) {
        logger.info('[Redis] Verificando conexión...');
        try {
            await redis.set('ping', 'pong', 10);
            logger.info('Redis verificado');
        } catch (err) {
            logger.error('[Redis] Error de conexión', err);
            // IMPORTANTE: Si la conexión a Redis es crítica, lanza el error
            // throw err; 
        }
    }
}

async function main() {
    // Ejecuta todas las inicializaciones asíncronas
    await initializeDataAndServices(); 
    
    const port = process.env.PORT || 4000;
    const app = express();
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use(cors({
      origin: process.env.FRONTEND_URL, // por ejemplo http://localhost:3001
      credentials: true
    }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(requestLogger)
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
    //console.log(`[APP DEBUG] Error fatal al iniciar la aplicación: ${err.message}`);
    logger.error(`Error fatal al iniciar la aplicación: ${err.message}`, err);
    // 🛑 Forzar el cierre con código de error si la inicialización falla
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`UNHANDLED REJECTION: ${reason}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
  process.exit(1); // Puedes quitar esto si prefieres no reiniciar el proceso
});
