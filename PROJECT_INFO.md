# Informacion del Proyecto

## Resumen

`secure-auth-api` es una API backend en `Node.js + TypeScript + Express` para autenticacion, suscripciones de negocio y operaciones de ventas. Usa `Prisma` con `PostgreSQL`, `Redis` para soporte de cache/rate limit y `Socket.IO` para eventos en tiempo real.

Puerto por defecto: `4000`

Zona horaria por defecto: `America/Lima`

Documentacion Swagger: `/api-docs`

Health check: `/health`

Base API: `/api`

## Stack principal

- `Express 4`
- `TypeScript 5`
- `Prisma ORM`
- `PostgreSQL`
- `Redis`
- `Socket.IO`
- `Zod`
- `Swagger`
- `node-cron`
- `Winston`
- `New Relic`
- `Multer` para uploads
- `PDFMake` y utilidades PDF

## Estructura principal

### `src/core`

Funcionalidad base del sistema:

- `auth`
- `user`
- `role`
- `permission`
- `view`
- `dashboard`
- `user-view`
- `role-view-permission`

### `src/modules/bussiness`

Dominio de suscripciones y negocio:

- servicios
- planes
- promociones
- suscripciones
- usuarios autorizados
- transacciones de pago
- recibos
- tarifas
- impuestos
- tipos de comprobante
- movimientos de suscripcion
- solicitudes
- archivos

### `src/modules/sales`

Dominio comercial y ventas:

- categorias
- productos
- clientes
- sucursales
- inventario
- movimientos entre sucursales
- caja
- pedidos
- items de pedido
- pagos de pedido
- favoritos
- dashboard de ventas
- analytics
- archivos
- consignaciones entregadas, salientes y liquidaciones

### Otras carpetas

- `src/config`: CORS, rate limit, DB, Swagger, variables
- `src/middlewares`: auth, permisos, errores, uploads, logger
- `src/shared/services`: Redis, email, upload, R2, PDF
- `src/utils`: helpers, cron, mailer, logger, seeds iniciales
- `prisma`: schema, migraciones y seed

## Arranque de la app

Archivo principal: `src/index.ts`

Hace esto al iniciar:

1. carga `New Relic`
2. fija timezone
3. crea roles iniciales
4. crea admin inicial
5. conecta Redis
6. inicia cron jobs
7. levanta servidor HTTP
8. inicializa Socket.IO
9. expone Swagger, health check y rutas `/api`

## Rutas principales

### Core

- `/api/auth`
- `/api/users`
- `/api/roles`
- `/api/permissions`
- `/api/views`
- `/api/dashboard`
- `/api/notifications`

### Suscripciones y negocio

- `/api/services`
- `/api/payment-frequencies`
- `/api/currencies`
- `/api/promotions`
- `/api/plans`
- `/api/subscriptions`
- `/api/authorized-users`
- `/api/payment-transactions`
- `/api/receipts`
- `/api/requests`
- `/api/rejection-reasons`
- `/api/taxes`
- `/api/receipt-types`
- `/api/subscription-movements`
- `/api/tariffs`
- `/api/files`

### Ventas

- `/api/sales/products`
- `/api/sales/categories`
- `/api/sales/clients`
- `/api/sales/branch-offices`
- `/api/sales/branch-office-products`
- `/api/sales/inventory`
- `/api/sales/cash-shifts`
- `/api/sales/branch-movements`
- `/api/sales/currencies`
- `/api/sales/societies`
- `/api/sales/orders`
- `/api/sales/orders/reports`
- `/api/sales/order-items`
- `/api/sales/order-payments`
- `/api/sales/favorites`
- `/api/sales/dashboard`
- `/api/sales/analytics`
- `/api/sales/files`
- `/api/sales/delivered-consignment-agreements`
- `/api/sales/external-consignment-sales`
- `/api/sales/outgoing-consignment-agreements`
- `/api/sales/received-consignment-settlements`

## Base de datos

`prisma/schema.prisma` define modelos para:

- usuarios, sesiones, cuentas
- roles, vistas, permisos
- servicios, planes, tarifas, promociones
- suscripciones y movimientos
- transacciones de pago y comprobantes
- archivos
- notificaciones
- clientes/ventas relacionadas
- `UbigeoPeru`

Motor configurado: `postgresql`

## Procesos automaticos

`src/utils/cron.service.ts`

Cron diario `0 0 * * *`:

- avisa renovaciones 7 dias antes
- genera movimientos/transacciones preventivas
- renueva automaticamente planes beta gratis
- expira suscripciones vencidas
- cancela suscripciones tras 7 dias de gracia

Timezone cron: `America/Lima`

## Scripts utiles

- `npm run dev`: migracion dev + seed + servidor con hot reload
- `npm run dev:start`: levanta `ts-node-dev`
- `npm run prisma:seed`: seed con `tsx`
- `npm run build`: compila TypeScript y corrige aliases
- `npm run start:prod`: migra y arranca `dist/index.js`
- `npm run migrate:deploy`: migraciones productivas + seed
- `npm run studio`: Prisma Studio
- `npm run docker:dev`: entorno Docker dev
- `npm run docker:clean`: baja contenedores y limpia volumenes/orphans

## Docker

Archivos:

- `Dockerfile`
- `docker-compose.yaml`
- `docker-compose.dev.yaml`

Flujo documentado en `README.md`:

- DEV con hot reload y volumenes montados
- PROD con build final y migraciones al iniciar

## Infra y soporte

- `Redis` usado por rate limiting y servicios compartidos
- `helmet`, `cors`, `hpp` para endurecimiento basico
- logger con `Winston`
- observabilidad con `New Relic`
- soporte de emails
- soporte de almacenamiento de archivos tipo `R2/S3`

## Variables y archivos sensibles

Revisar:

- `.env`
- `.env.example`
- `env.prod.example`

## Estado actual del repo

- carpeta `dist` presente
- carpeta `node_modules` presente
- existen logs locales en `logs` y `newrelic_agent.log`
