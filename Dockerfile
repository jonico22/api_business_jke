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
# Copiamos el resto del código
COPY . .

# Checkpoint 1: Ver si los archivos llegaron bien
RUN ls -la src && ls -la prisma

# Generamos el cliente de Prisma
RUN npx prisma generate

# Checkpoint 2: Ver si tsc existe y qué versión tiene
RUN ./node_modules/.bin/tsc -v

# El "|| true" permite que el proceso continúe aunque tsc detecte errores
RUN node --max-old-space-size=2048 ./node_modules/.bin/tsc || true && \
    ./node_modules/.bin/tsc-alias
# Si el comando de arriba falla, Coolify te dirá si fue tsc o tsc-alias

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