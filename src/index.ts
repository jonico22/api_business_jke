import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import adminRoutes from './routes/admin.routes';
import permissionRoutes from './routes/permission.routes';
import viewRoutes from './routes/view.routes';
import roleViewPermissionRoutes from './routes/roleViewPermission.routes';
import { createPermissions } from './utils/create-permissions';
import { createDefaultRoles } from './utils/create-roles';
import { createInitialAdmin } from './utils/create-admin';
import requestLogger from './middlewares/logger.middleware';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/views', viewRoutes);
app.use('/api/role-view-permissions', roleViewPermissionRoutes);
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