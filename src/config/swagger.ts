import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure Auth API',
      version: '1.0.0',
      description: 'API para gestión de autenticación, usuarios, roles y permisos',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/core/**/*.ts', './src/modules/bussiness/**/*.ts','./src/modules/customer/**/*.ts'], // ajusta la ruta a tus controladores
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
