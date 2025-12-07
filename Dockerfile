FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

# 'apt-get update' es necesario para actualizar la lista de paquetes
# 'apt-get install -y openssl' instala la librería libssl necesaria para Prisma
RUN apt-get update -y && apt-get install -y openssl

RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 4000


# The original CMD becomes the default command for the entrypoint script
CMD ["npm", "run", "start:prod"]
