  ---

  🛡️ Secure Auth API

  API RESTful construida con Node.js, TypeScript, Express, Prisma y PostgreSQL, que implementa autenticación
  segura, gestión de usuarios, roles, permisos y sesiones.

  🚀 Levantando el Proyecto Localmente (con Docker)

  La forma recomendada y más sencilla de ejecutar este proyecto es a través de Docker, que gestionará tanto la
  API como la base de datos y Redis de manera aislada y consistente.

  Prerrequisitos

   * Asegúrate de tener instalado Docker y Docker Compose.

  Pasos para la Instalación

  1. Clonar el Repositorio

   1 git clone https://github.com/tu-usuario/secure-auth-api.git
   2 cd secure-auth-api

  2. Configurar las Variables de Entorno

  Este proyecto utiliza un archivo .env para gestionar las credenciales y otras configuraciones sensibles. Para
  empezar, simplemente copia el archivo de ejemplo:

   1 cp .env.example .env

  Importante: El archivo .env ya viene preconfigurado para funcionar con los servicios definidos en
  docker-compose.yml (por ejemplo, DATABASE_URL apunta al servicio db). No necesitas cambiar nada en este
  archivo para el entorno local de Docker.

  3. Iniciar los Contenedores

  Ejecuta el siguiente comando para construir las imágenes y levantar todos los servicios en segundo plano:

   1 docker-compose up -d --build

  Este comando hará lo siguiente:
   * Construirá la imagen de Docker para la API de Node.js según las instrucciones del Dockerfile.
   * Descargará y ejecutará las imágenes oficiales de PostgreSQL y Redis.
   * Creará una red interna para que los contenedores se comuniquen entre sí.

  4. Aplicar Migraciones de la Base de Datos

  Con los servicios ya en ejecución, necesitas aplicar el esquema de la base de datos. Para ello, ejecuta el
  siguiente comando que se conecta al contenedor de la API y corre la migración de Prisma:

   1 docker-compose exec api npx prisma migrate deploy

  5. (Opcional) Cargar Datos Iniciales (Semillas)

  El proyecto está configurado para crear automáticamente permisos, roles por defecto y un usuario administrador
  la primera vez que se inicia. Si necesitas volver a ejecutar este proceso o modificarlo, puedes encontrar la
  lógica en los archivos dentro de src/utils/.

  6. ¡Listo para Usar!

  Tu entorno de desarrollo completo está ahora en funcionamiento:
   * API disponible en: http://localhost:4000
   * Documentación de la API (Swagger): http://localhost:4000/api-docs

  Comandos Útiles de Docker

   * Ver los logs de la API:
   1     docker-compose logs -f api
   * Detener todos los servicios:
   1     docker-compose down
   * Acceder al shell del contenedor de la API:

   1     docker-compose exec api bash
   * Acceder a la base de datos PostgreSQL:
   1     docker-compose exec db psql -U user -d secure_auth_api
      (La contraseña es password, como se define en docker-compose.yml)