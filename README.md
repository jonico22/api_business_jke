# 🚀 Secure Auth API - Guía de Entornos Docker

Esta guía explica cómo configurar y ejecutar la API utilizando **Docker Compose** en dos modos distintos: **Desarrollo (DEV)** para *hot-reload* y **Producción (PROD)** para despliegue final.

## 🛠️ Requisitos Previos

Asegúrate de tener instalados los siguientes programas:

* **Docker Desktop** (o Docker Engine)
* **Docker Compose** (Generalmente incluido en Docker Desktop)

## Configurar las Variables de Entorno

  Este proyecto utiliza un archivo .env para gestionar las credenciales y otras configuraciones sensibles. Para
  empezar, simplemente copia el archivo de ejemplo:
  
  ```bash
  cp .env.example .env
  ```

## 📂 Estructura de Archivos y Estrategia

La separación entre entornos se logra mediante la estrategia de **Multi-stage Build** en el `Dockerfile` y la **Sobrescritura de Comandos** en Docker Compose.

| Archivo | Uso | Alias/Target | Comando de Inicio |
| :--- | :--- | :--- | :--- |
| **`Dockerfile`** | PROD / DEV Base | `deps`, `runner` | `CMD ["node", "dist/index.js"]` (Por defecto) |
| **`docker-compose.yaml`** | **PROD** Base | `target: runner` | **`command: npm run start:prod`** |
| **`docker-compose.dev.yaml`** | **DEV** Override | `target: deps` | **`command: npm run dev`** |

---

## I. 💻 Modo Desarrollo (DEV)

El modo Desarrollo utiliza **volúmenes montados** para compartir el código fuente y el modo **`--poll`** para la **recarga en caliente (*hot-reload*)**.

### 1. Comando de Ejecución

Usamos ambos archivos Compose para fusionar la configuración base con los *overrides* de desarrollo.

```bash
# Ejecuta la API, DB y Redis usando la configuración de desarrollo
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up api db redis --build
```

### 2. Comportamiento
Construcción: Docker construye solo hasta la etapa deps del Dockerfile (la que tiene npm install).

Volúmenes: El código local sobrescribe el directorio /usr/src/app en el contenedor.

Inicio: El comando sobrescrito es npm run dev, que ejecuta:

npx prisma generate y npx prisma migrate dev (Generación de cliente y migraciones de desarrollo).

ts-node-dev --poll src/index.ts (Inicia el servidor con hot-reload).

Acceso: La API estará disponible en http://localhost:4000.

### 3. Detener el Entorno

```bash
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml down
```
## 🏭 Modo Producción (PROD)

El modo Producción utiliza la imagen final optimizada (target: runner) y ejecuta el script de migración e inicio de forma secuencial, garantizando que la base de datos esté lista.

### 1. Comando de Ejecución
Solo usamos el archivo base docker-compose.yaml.

```bash
# Ejecuta la API, DB y Redis en modo producción y en segundo plano
docker compose up api db redis --build -d
```
### 2. Comportamiento
Construcción: Docker construye hasta la etapa runner (imagen final, sin código fuente ni dependencias de desarrollo).

Dependencia: El servicio api espera a que el servicio db esté en estado service_healthy antes de iniciar.

Inicio: El comando sobrescrito es npm run start:prod, que ejecuta:

npm run migrate:deploy (Aplica las migraciones pendientes en el servidor).

node dist/index.js (Inicia el servidor compilado).

Acceso: La API estará disponible en http://localhost:4000 (o el puerto configurado).

### 3. Detener el Entorno

```bash
docker compose down
```

# III. 💡 Comandos Adicionales Útiles

Comando	Descripción	Entorno

Logs	Ver logs de un servicio (ejemplo: API) en tiempo real.	DEV / PROD

```bash
  docker compose logs api -f	
```

Entrar al Contenedor	Abrir una shell bash dentro del contenedor API.	DEV / PROD
		
```bash
docker compose exec api bash
```
Reconstruir Solo API	Reconstruir la imagen de la API (útil si cambias dependencias).	DEV / PROD

```bash
docker compose up api --build	
```
	
Limpiar Volúmenes	Eliminar los datos persistentes de la DB (¡usar con precaución!).	DEV

```bash
docker compose down -v
```

importante para cambiar cuando este estable
"migrate:deploy": "npx prisma migrate deploy && npm run prisma:seed"

docker compose -f docker-compose.yaml -f docker-compose.dev.yaml down
docker network rm coolify
docker network create coolify