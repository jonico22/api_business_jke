# --------------------------------------------------------
# 1. ETAPA BASE (Compartida)
# --------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Instalamos dependencias mínimas para poder descargar e instalar Infisical
# En Alpine necesitamos bash y curl para el script de instalación
RUN apk add --no-cache bash curl && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add --no-cache infisical

# --------------------------------------------------------
# 2. ETAPA DEPS
# --------------------------------------------------------
FROM base AS deps
# 'libc6-compat' y 'openssl' son críticos para Prisma en Alpine
RUN apk update && \
    apk add --no-cache --virtual .build-deps python3 make g++ libc6-compat && \
    apk add --no-cache openssl

COPY package*.json ./ 

RUN npm install && \
    apk del .build-deps && \
    rm -rf /var/cache/apk/*

# --------------------------------------------------------
# 3. ETAPA BUILDER
# --------------------------------------------------------
FROM deps AS builder
COPY . .
# Importante: Prisma genera el cliente basado en el OS actual
RUN npx prisma generate
RUN npm run build

# --------------------------------------------------------
# 4. ETAPA RUNNER (Imagen Final de Producción)
# --------------------------------------------------------
FROM base AS runner
# Heredamos de 'base', por lo que ya tenemos el CLI de Infisical instalado
ENV NODE_ENV=production

# Copiamos solo lo necesario
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 4000

# --------------------------------------------------------
# EL CAMBIO CLAVE:
# --------------------------------------------------------
# Infisical leerá las variables de entorno de Coolify 
# (CLIENT_ID y CLIENT_SECRET) para autenticarse e inyectar los secretos
CMD ["infisical", "run", "--", "node", "dist/index.js"]