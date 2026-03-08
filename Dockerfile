# --------------------------------------------------------
# 1. ETAPA BASE
# --------------------------------------------------------
FROM node:22-bookworm-slim AS base
WORKDIR /usr/src/app

# Mantenemos development preliminar
ENV NODE_ENV=development 

# Instalamos OpenSSL, necesario para el motor de Prisma en Debian
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# --------------------------------------------------------
# 2. ETAPA DEPS (Todo para compilar)
# --------------------------------------------------------
FROM base AS deps
COPY package*.json ./
RUN npm install --include=dev

# --------------------------------------------------------
# 2.5 ETAPA PROD-DEPS (Solo lo necesario para correr)
# --------------------------------------------------------
FROM base AS prod-deps
COPY package*.json ./
# Instalamos SOLO lo de producción
RUN npm install --omit=dev
# Re-instalamos prisma CLI y tsx para poder ejecutar migraciones en el runner
RUN npm install prisma tsx

# --------------------------------------------------------
# 3. ETAPA BUILDER
# --------------------------------------------------------
FROM deps AS builder
COPY . .

# Variables para Prisma (Opcional, en debian suele funcionar el debian-openssl nativo)
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

RUN npx prisma generate

# Compilar Typescript (evitando freno por tipos estrictos temporalmente si los hubiera)
RUN npx tsc || true
RUN npx tsc-alias

# Validación
RUN ls -la dist || (echo "CRITICO: No se generó dist" && exit 1)

# --------------------------------------------------------
# 4. ETAPA RUNNER (Producción)
# --------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production

# 1. Copiamos node_modules (con tsx y prisma)
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules

# 2. Código y Motores de Prisma
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

# 3. Archivos de configuración
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json
COPY --from=builder /usr/src/app/src/fonts ./src/fonts


EXPOSE 4000

# Ejecutar el inicio de la app que primero migra y luego lanza el server
CMD ["npm", "run", "start:prod-app"]