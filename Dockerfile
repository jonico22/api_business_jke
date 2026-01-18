# --------------------------------------------------------
# 1. ETAPA BASE
# --------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /usr/src/app

ARG INFISICAL_CLIENT_ID
ARG INFISICAL_CLIENT_SECRET
ARG INFISICAL_ENV
ARG INFISICAL_PROJECT_PATH
ARG NODE_ENV

RUN apk add --no-cache bash curl && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add --no-cache infisical

# --------------------------------------------------------
# 2. ETAPA DEPS (Instalación limpia de dependencias)
# --------------------------------------------------------
FROM base AS deps
RUN apk update && apk add --no-cache python3 make g++ libc6-compat openssl

COPY package*.json ./
# Instalamos aquí para que esta capa se guarde en caché y no se repita
RUN npm install

# --------------------------------------------------------
# 3. ETAPA BUILDER
# --------------------------------------------------------
FROM deps AS builder
COPY . .

# Paso crítico para Prisma en Alpine
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

# Generamos el cliente (Checkpoint 1)
RUN npx prisma generate

# Checkpoint 2: Verificamos si los tipos de Prisma se crearon
RUN ls -la node_modules/.prisma/client

# Ejecutamos el build con captura de errores forzada
# Usamos "|| (node ...)" para que si falla, nos imprima los errores en el log
RUN node --max-old-space-size=2048 ./node_modules/.bin/tsc --pretty > build_log.txt 2>&1 || \
    (echo "--- ERROR DE TYPESCRIPT DETECTADO ---" && cat build_log.txt && exit 1)

# Si el tsc pasa, corremos el alias
RUN ./node_modules/.bin/tsc-alias

# Verificación final
RUN ls -la dist
# --------------------------------------------------------
# 4. ETAPA RUNNER (Producción)
# --------------------------------------------------------
FROM base AS runner
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 4000

CMD ["infisical", "run", "--", "node", "dist/index.js"]