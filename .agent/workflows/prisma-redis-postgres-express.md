---
description: Workflow/Agente especializado en Prisma, Redis, PostgreSQL y Express.js con TypeScript para el desarrollo de APIs backend
---

# 🔧 Agente Especializado: Prisma + Redis + PostgreSQL + Express.js + TypeScript

Este workflow proporciona instrucciones detalladas para desarrollar, mantener y optimizar la API backend utilizando las tecnologías del stack definido.

---

## 📦 Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Express.js** | ^4.22.1 | Framework web HTTP |
| **TypeScript** | ^5.4.0 | Tipado estático |
| **Prisma** | ^6.13.0 | ORM para PostgreSQL |
| **PostgreSQL** | 14+ | Base de datos relacional |
| **Redis** | ^5.5.6 | Cache y rate limiting |
| **Zod** | ^3.22.4 | Validación de schemas |

---

## 🏗️ Arquitectura del Proyecto

```
src/
├── config/           # Configuraciones (database, redis, cors, rateLimit)
├── core/             # Lógica central del negocio
├── middlewares/      # Middlewares de Express
├── modules/          # Módulos de la aplicación (controladores, servicios, rutas)
├── routes/           # Definición de rutas principales
├── shared/           # Servicios y utilidades compartidas
├── utils/            # Utilidades generales
└── validations/      # Schemas de validación con Zod

prisma/
├── schema.prisma     # Definición del modelo de datos
├── migrations/       # Migraciones de base de datos
├── seed.ts           # Script de seed para datos iniciales
```

---

## 🔄 Comandos Principales

```bash
# Desarrollo
// turbo
npm run dev               # Inicia servidor de desarrollo con hot-reload

# Prisma
// turbo
npm run dev:prisma        # Genera cliente Prisma y ejecuta migraciones
// turbo
npm run prisma:seed       # Ejecuta el seeding de la base de datos
// turbo
npx prisma studio         # Abre el panel visual de Prisma

# Docker
// turbo
npm run docker:dev        # Inicia contenedores con docker-compose
// turbo
npm run docker:clean      # Limpia contenedores y volúmenes
```

---

## 📊 Prisma: Mejores Prácticas

### 1. Definición de Modelos

Al definir modelos en `prisma/schema.prisma`:

```prisma
model NuevoModelo {
  id          String   @id @default(uuid())
  name        String
  description String?
  isActive    Boolean  @default(true)
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  updatedBy   String?

  // Relaciones
  relatedId   String
  related     RelatedModel @relation(fields: [relatedId], references: [id])
}
```

**Reglas obligatorias:**
- Siempre usar `uuid()` para IDs
- Incluir campos de auditoría: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
- Usar `isActive` e `isDeleted` para soft-delete
- Relaciones deben tener `@relation` explícito

### 2. Operaciones con Prisma Client

```typescript
import prisma from '@/config/database';

// Consulta básica con relaciones
const usuarios = await prisma.user.findMany({
  where: { isActive: true, isDeleted: false },
  include: { role: true },
  orderBy: { createdAt: 'desc' }
});

// Transacciones
const resultado = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { ... } });
  const account = await tx.account.create({ data: { userId: user.id, ... } });
  return { user, account };
});
```

### 3. Migraciones

```bash
# Crear migración
// turbo
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones en producción
// turbo
npx prisma db push

# Ver estado de migraciones
// turbo
npx prisma migrate status
```

---

## 🔴 Redis: Configuración y Uso

### 1. Configuración del Cliente

El cliente Redis está en `src/shared/services/redis.service.ts`:

```typescript
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
});

await client.connect();
export default client;
```

### 2. Casos de Uso Comunes

**Rate Limiting (ya configurado en `src/config/rateLimit.ts`):**
```typescript
import RedisStore from 'rate-limit-redis';
import client from '@/shared/services/redis.service';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({
    sendCommand: (...args: string[]) => client.sendCommand(args),
  }),
});
```

**Cache de datos:**
```typescript
// Guardar en cache (TTL en segundos)
await client.setEx('user:123', 3600, JSON.stringify(userData));

// Obtener de cache
const cached = await client.get('user:123');
const userData = cached ? JSON.parse(cached) : null;

// Invalidar cache
await client.del('user:123');

// Cache con patrón
await client.keys('user:*').then(keys => client.del(keys));
```

---

## 🚀 Express.js: Patrones del Proyecto

### 1. Estructura de Módulos

Cada módulo debe seguir esta estructura:

```
modules/
└── nombre-modulo/
    ├── nombre-modulo.controller.ts   # Controladores HTTP
    ├── nombre-modulo.service.ts      # Lógica de negocio
    ├── nombre-modulo.routes.ts       # Definición de rutas
    ├── nombre-modulo.schema.ts       # Validaciones con Zod
    └── nombre-modulo.types.ts        # Tipos TypeScript (opcional)
```

### 2. Controlador Estándar

```typescript
// nombre-modulo.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NombreModuloService } from './nombre-modulo.service';
import { createSchema, updateSchema } from './nombre-modulo.schema';
import { AppError } from '@/utils/AppError';

export class NombreModuloController {
  private service: NombreModuloService;

  constructor() {
    this.service = new NombreModuloService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.findAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await this.service.findById(id);
      if (!data) throw new AppError('Recurso no encontrado', 404);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createSchema.parse(req.body);
      const data = await this.service.create(validatedData);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = updateSchema.parse(req.body);
      const data = await this.service.update(id, validatedData);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.softDelete(id);
      res.json({ success: true, message: 'Eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  };
}
```

### 3. Servicio Estándar

```typescript
// nombre-modulo.service.ts
import prisma from '@/config/database';
import { Prisma } from '@prisma/client';

export class NombreModuloService {
  async findAll() {
    return prisma.nombreModelo.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.nombreModelo.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.NombreModeloCreateInput) {
    return prisma.nombreModelo.create({ data });
  }

  async update(id: string, data: Prisma.NombreModeloUpdateInput) {
    return prisma.nombreModelo.update({
      where: { id },
      data
    });
  }

  async softDelete(id: string) {
    return prisma.nombreModelo.update({
      where: { id },
      data: { isDeleted: true }
    });
  }
}
```

### 4. Validación con Zod

```typescript
// nombre-modulo.schema.ts
import { z } from 'zod';

export const createSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().optional(),
  email: z.string().email('Email inválido'),
  isActive: z.boolean().default(true)
});

export const updateSchema = createSchema.partial();

export const idSchema = z.object({
  id: z.string().uuid('ID inválido')
});

// Para usarlo en req.params
export const categoryIdSchema = z.string().uuid('ID de categoría inválido');
```

### 5. Definición de Rutas

```typescript
// nombre-modulo.routes.ts
import { Router } from 'express';
import { NombreModuloController } from './nombre-modulo.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { validateRequest } from '@/middlewares/validate.middleware';

const router = Router();
const controller = new NombreModuloController();

router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
```

---

## 🛡️ Manejo de Errores

### AppError Personalizado

```typescript
// src/utils/AppError.ts
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Uso en Controladores

```typescript
import { AppError } from '@/utils/AppError';

// Errores comunes
throw new AppError('Recurso no encontrado', 404);
throw new AppError('No autorizado', 401);
throw new AppError('Acceso denegado', 403);
throw new AppError('Datos inválidos', 400);
throw new AppError('Conflicto de datos', 409);
```

---

## 🐳 Docker: Desarrollo Local

### docker-compose.dev.yaml

```yaml
services:
  api:
    build: .
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/dbname
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: dbname
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 📝 Checklist para Nuevas Funcionalidades

- [ ] **Modelo Prisma**: Crear/modificar en `prisma/schema.prisma`
- [ ] **Migración**: Ejecutar `npx prisma migrate dev --name feat_nombre`
- [ ] **Schema Zod**: Crear validaciones en `modules/nombre/nombre.schema.ts`
- [ ] **Servicio**: Implementar lógica de negocio en `.service.ts`
- [ ] **Controlador**: Implementar endpoints en `.controller.ts`
- [ ] **Rutas**: Registrar rutas en `.routes.ts`
- [ ] **Swagger**: Documentar endpoints con JSDoc
- [ ] **Redis Cache**: Implementar cache si aplica
- [ ] **Tests**: Crear tests unitarios/integración

---

## 🔍 Debugging y Logs

### Configuración de Winston (ya implementado)

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### Uso en Servicios

```typescript
import { logger } from '@/config/logger';

logger.info('Operación exitosa', { userId, action: 'create' });
logger.error('Error en operación', { error: err.message, stack: err.stack });
logger.warn('Advertencia', { mensaje: 'Cache no disponible' });
```

---

## 🔐 Seguridad

### Middlewares de Seguridad (ya configurados)

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Control de orígenes permitidos
- **Rate Limiting**: Límite de peticiones con Redis
- **HPP**: Prevención de HTTP Parameter Pollution

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

---

## 📚 Referencias Rápidas

- [Prisma Docs](https://www.prisma.io/docs)
- [Redis Node Client](https://github.com/redis/node-redis)
- [Express.js Guide](https://expressjs.com/en/guide)
- [Zod Documentation](https://zod.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
