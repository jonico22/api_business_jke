import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { createPermissions } from './utils/create-permissions';
import { createDefaultRoles } from './utils/create-roles';
import { createInitialAdmin } from './utils/create-admin';
import { createViews } from './utils/create-view';
import { createDocumentTypes} from './utils/create-type-doc';
import requestLogger from './middlewares/logger.middleware';
import { logger } from './utils/logger';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from '@/middlewares/error.middleware';
import { redis } from '@/shared/services/redis.service';
import { createRoleViewPermission } from './utils/create-role-view-permission';
import cookieParser from 'cookie-parser';

dotenv.config();

async function startServer() {
  if (redis.enabled) {
     logger.info('[Redis] Verificando conexión...');
    try {
      await redis.set('ping', 'pong', 10);
    } catch (err) {
      logger.error('[Redis] Error de conexión', err);
    }
  }
}

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (_req, res) => res.send('API activa'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({
  origin: process.env.FRONTEND_URL, // por ejemplo http://localhost:3001
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);
app.use('/api', routes);


(async () => { 
  await createPermissions();
  await createDefaultRoles();
  await createInitialAdmin();
  await createViews();
  await createRoleViewPermission();
  await createDocumentTypes();
  logger.info('Permisos, roles, administrador inicial y vistas creados');
})();

startServer()
  .then(() => logger.info('Servidor iniciado y Redis verificado'))
  .catch((err) => logger.error(`Error al iniciar el servidor: ${err.message}`));

app.listen(port, () => console.log(`🚀 Servidor en http://localhost:${port}`));

// Middleware para ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  logger.error(`UNHANDLED REJECTION: ${reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
  process.exit(1); // Puedes quitar esto si prefieres no reiniciar el proceso
});

// falta la paginacion en las tablas principales
// falta buscar por campo en las tablas principales