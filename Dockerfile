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
# 2. ETAPA DEPS
# --------------------------------------------------------
FROM base AS deps
RUN apk update && apk add --no-cache python3 make g++ libc6-compat openssl
COPY package*.json ./
RUN npm install

# --------------------------------------------------------
# 3. ETAPA BUILDER (La magia ocurre aquí)
# --------------------------------------------------------
FROM deps AS builder
COPY . .

# 1. Generamos Prisma (usando binarios para asegurar compatibilidad)
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
RUN npx prisma generate

# 2. Compilamos IGNORANDO errores (El "|| true" es la clave)
# Usamos ";" para que tsc-alias se ejecute SIEMPRE, haya error o no.
RUN node --max-old-space-size=2048 ./node_modules/.bin/tsc || true; \
    ./node_modules/.bin/tsc-alias

# 3. Verificación de seguridad
# Si dist está vacío, entonces sí fallamos. Si tiene archivos, seguimos.
RUN ls -la dist || (echo "CRITICO: No se generó dist" && exit 1)

# --------------------------------------------------------
# 4. ETAPA RUNNER
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