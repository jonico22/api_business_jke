# 🛡️ Secure Auth API

API RESTful construida con **Node.js**, **TypeScript**, **Express**, **Prisma** y **PostgreSQL**, que implementa autenticación segura con `better-auth`, control de usuarios, roles, permisos, vistas y sesiones.

## 📦 Tecnologías

- Node.js + TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Zod (validaciones)
- Argon2 (hash de contraseñas)
- Nodemailer (correo electrónico)
- Winston (logs)
- better-auth (autenticación segura)
- CORS

---

## 🚀 Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/tu-usuario/secure-auth-api.git
cd secure-auth-api
```

### 2. Instalar dependencias
```bash
npm install
```
### 3. Configurar variables de entorno

```bash
cp .env.example .env
```
### 4. Crear base de datos y aplicar migraciones

```bash
npx prisma migrate dev --name init
```

Opcional para revisar con GUI:
```bash
npx prisma studio

```

## Problemas con cli prisma
```bash

  rm -rf node_modules #window sin -rf
  npm install 
  npx prisma generate

```

## Nueva estructura

```bash
src/
├── config/
├── core/
│   ├── auth/
│   ├── user/
│   ├── role/
│   ├── permission/
│   └── view/
├── modules/
│   ├── empresa/
│   ├── producto/
│   ├── venta/
│   └── factura/
├── middlewares/
├── routes/
│   └── index.ts
├── utils/
├── validations/
├── index.ts
```

