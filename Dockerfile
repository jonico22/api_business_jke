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
# 4. ETAPA RUNNER (Producción Final)
# --------------------------------------------------------
FROM base AS runner
RUN apk add --no-cache openssl libc6-compat

# Importante: Cambiamos a producción
ENV NODE_ENV=production

# CORRECCION 2: Copia limpia y sin duplicados
# A) Copiamos modulos LIMPIOS desde prod-deps
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules

# B) Copiamos el código compilado desde builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 4000

CMD infisical run --projectId $INFISICAL_PROJECT_ID -- node dist/index.js