# --------------------------------------------------------
# 1. ETAPA BASE (Compartida)
# --------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# --------------------------------------------------------
# 2. ETAPA DEPS (Aquí es donde "vive" Desarrollo)
# --------------------------------------------------------
# Instalar dependencias de compilación y openssl en UNA SOLA capa (RUN)
# Usamos 'libc6-compat' que a veces es necesario en Alpine para Node
FROM base AS deps
RUN apk update && \
    apk add --no-cache --virtual .build-deps python3 make g++ libc6-compat && \
    apk add --no-cache openssl

# Copiar package.json y package-lock.json ANTES de npm install
COPY package*.json ./ 

# Instalar y luego limpiar las herramientas de compilación
RUN npm install && \
    apk del .build-deps && \
    rm -rf /var/cache/apk/* # <--- ¡SIN comillas invertidas!

# --------------------------------------------------------
# 3. ETAPA BUILDER (Solo para compilar Producción)
# --------------------------------------------------------
FROM deps AS builder
# Aquí sí copiamos el código para compilarlo
COPY . .
RUN npx prisma generate
RUN npm run build

# --------------------------------------------------------
# 4. ETAPA RUNNER (Imagen Final de Producción)
# --------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production

# Copiamos solo lo necesario desde el Builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 4000

# El comando por defecto es PROD
CMD ["node", "dist/index.js"]
#CMD ["npm", "run", "start:prod"]
