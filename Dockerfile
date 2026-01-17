# --------------------------------------------------------
# 1. ETAPA BASE
# --------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Declaramos los ARG que Coolify envía (según tu log de error)
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
RUN apk update && \
    apk add --no-cache python3 make g++ libc6-compat openssl

COPY package*.json ./ 
RUN npm install

# --------------------------------------------------------
# 3. ETAPA BUILDER
# --------------------------------------------------------
FROM deps AS builder
COPY . .
# Generamos Prisma con las variables necesarias
RUN npx prisma generate
RUN npm run build || (echo "--- ERROR DETECTADO EN EL BUILD ---" && npm run build --v && exit 1)

# --------------------------------------------------------
# 4. ETAPA RUNNER (Producción)
# --------------------------------------------------------
FROM base AS runner
# IMPORTANTE: Prisma necesita estas librerías en la imagen final
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 4000

# Infisical usará las variables inyectadas por Coolify en el runtime
CMD ["infisical", "run", "--", "node", "dist/index.js"]