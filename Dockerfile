# --------------------------------------------------------
# 1. ETAPA BASE
# --------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /usr/src/app

ARG INFISICAL_CLIENT_ID
ARG INFISICAL_CLIENT_SECRET
ARG INFISICAL_ENV
ARG INFISICAL_PROJECT_PATH
ARG INFISICAL_PROJECT_ID
# Mantenemos development para que las etapas de instalación funcionen bien
ENV NODE_ENV=development 

RUN apk add --no-cache bash curl && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add --no-cache infisical

# --------------------------------------------------------
# 2. ETAPA DEPS (Todo para compilar)
# --------------------------------------------------------
FROM base AS deps
RUN apk update && apk add --no-cache python3 make g++ libc6-compat openssl
COPY package*.json ./

# CORRECCION 1: Faltaba instalar las dependencias aquí
RUN npm install --include=dev

# --------------------------------------------------------
# 2.5 ETAPA PROD-DEPS (Solo lo necesario para correr)
# --------------------------------------------------------
FROM base AS prod-deps
COPY package*.json ./
# Instalamos SOLO lo de producción
RUN npm install --omit=dev
# 2. ¡IMPORTANTE! Re-instalamos prisma CLI para poder ejecutar migraciones
RUN npm install prisma tsx
# --------------------------------------------------------
# 3. ETAPA BUILDER
# --------------------------------------------------------
FROM deps AS builder
COPY . .

# Variables para Prisma
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

RUN npx prisma generate

# Usamos npx para asegurar que encuentre tsc
RUN npx tsc || true
RUN npx tsc-alias

# Validación
RUN ls -la dist || (echo "CRITICO: No se generó dist" && exit 1)

# --------------------------------------------------------
# 4. ETAPA RUNNER (Producción)
# --------------------------------------------------------
FROM base AS runner
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# 1. Copiamos node_modules (ahora con tsx y prisma)
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules

# 2. Código y Motores de Prisma
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

# 3. IMPORTANTE: Copiamos los archivos de configuración para los PATHS y el SEED
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json

# 👇 AÑADE ESTA LÍNEA (Copia las fuentes desde el código original)
COPY --from=build /usr/src/app/src/fonts ./src/fonts
EXPOSE 4000

# Tu comando CMD con el login (o el que te funcionó)
CMD export INFISICAL_TOKEN=$(infisical login --method=universal-auth --client-id=$INFISICAL_CLIENT_ID --client-secret=$INFISICAL_CLIENT_SECRET --domain=${INFISICAL_API_URL:-https://app.infisical.com} --silent --plain) && \
    infisical run --token=$INFISICAL_TOKEN --projectId=$INFISICAL_PROJECT_ID --env=$INFISICAL_ENV --path=$INFISICAL_PROJECT_PATH -- npm run start:prod-app