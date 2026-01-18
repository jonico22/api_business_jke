# --------------------------------------------------------
# 1. ETAPA BASE
# --------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Variables de Infisical
ARG INFISICAL_CLIENT_ID
ARG INFISICAL_CLIENT_SECRET
ARG INFISICAL_ENV
ARG INFISICAL_PROJECT_PATH
ARG NODE_ENV

RUN apk add --no-cache bash curl && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add --no-cache infisical

# --------------------------------------------------------
# 2. ETAPA DEPS (Instalación aislada)
# --------------------------------------------------------
FROM base AS deps
# Instalamos librerías nativas para Prisma y Argon2
RUN apk update && apk add --no-cache python3 make g++ libc6-compat openssl

# COPIAMOS SOLO package.json para instalar limpio
COPY package*.json ./
# Instalamos desde cero en Linux (esto ignora lo que tengas en Windows)
RUN npm install

# --------------------------------------------------------
# 3. ETAPA BUILDER
# --------------------------------------------------------
FROM deps AS builder
# Ahora copiamos el código (el .dockerignore evitará que entre tu node_modules de Windows)
COPY . .

# Checkpoint: ¿Están los binarios?
RUN ls -l ./node_modules/.bin/tsc || (echo "ERROR: No se encuentra TSC" && exit 1)

# Generamos Prisma
RUN npx prisma generate

# Ejecutamos el build usando el comando de tu package.json
RUN npm run build

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

# El script de inicio ya tiene el && que corregiste
CMD ["infisical", "run", "--", "node", "dist/index.js"]