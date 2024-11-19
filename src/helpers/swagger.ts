import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Configurações do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Raiders Academy API',
      version: '1.0.0',
      description: 'Documentação da API da Raiders Academy',
    },
    servers: [
      {
        url: 'raiders-academy-backend.vercel.app',
      },
    ],
  },
  apis: ['./dist/routes/*.{ts,js}'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export const setupSwagger = (app: Express): void => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  console.log('Swagger disponível em /docs');
};
