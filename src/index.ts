import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { createPermissions } from './utils/create-permissions';
import { createDefaultRoles } from './utils/create-roles';
import { createInitialAdmin } from './utils/create-admin';
import requestLogger from './middlewares/logger.middleware';
import { logger } from './utils/logger';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use('/api', routes);
app.get('/', (_req, res) => res.send('API activa'));

(async () => { 
  await createPermissions();
  await createDefaultRoles();
  await createInitialAdmin();
})();

app.listen(port, () => console.log(`🚀 Servidor en http://localhost:${port}`));

process.on('unhandledRejection', (reason) => {
  logger.error(`UNHANDLED REJECTION: ${reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
  process.exit(1); // Puedes quitar esto si prefieres no reiniciar el proceso
});

// falta la paginacion en las tablas principales
// falta buscar por campo en las tablas principales