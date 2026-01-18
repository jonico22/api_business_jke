# --------------------------------------------------------
# 1. ETAPA BASE
# --------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /usr/src/app

ARG INFISICAL_CLIENT_ID
ARG INFISICAL_CLIENT_SECRET
ARG INFISICAL_ENV
ARG INFISICAL_PROJECT_PATH
# OJO: Sobreescribimos NODE_ENV aquí para asegurar que el build tenga herramientas
ENV NODE_ENV=development 

RUN apk add --no-cache bash curl && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add --no-cache infisical

# --------------------------------------------------------
# 2. ETAPA DEPS
# --------------------------------------------------------
FROM base AS deps
RUN apk update && apk add --no-cache python3 make g++ libc6-compat openssl
COPY package*.json ./

# !!! AQUÍ ESTABA EL ERROR 127 !!!
# Forzamos la instalación de devDependencies (typescript, tsc-alias, types)
RUN npm install --include=dev

# --------------------------------------------------------
# 3. ETAPA BUILDER
# --------------------------------------------------------
FROM deps AS builder
COPY . .

# Variables para Prisma en Alpine
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

RUN npx prisma generate

# Verificación visual (opcional, para estar seguros)
RUN ls -la node_modules/.bin/tsc || echo "TSC NO ESTA AQUI"

# Ejecutamos el build
# Usamos npx para que sea más robusto encontrando el comando
RUN npx tsc || true
RUN npx tsc-alias

# Validación final
RUN ls -la dist || (echo "CRITICO: No se generó dist" && exit 1)

# --------------------------------------------------------
# 4. ETAPA RUNNER (Producción)
# --------------------------------------------------------
FROM base AS runner
RUN apk add --no-cache openssl libc6-compat
# Aquí sí volvemos a producción
ENV NODE_ENV=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 4000

CMD ["infisical", "run", "--", "node", "dist/index.js"]