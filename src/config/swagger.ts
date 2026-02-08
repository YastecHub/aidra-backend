import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aidra API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for Aidra donation platform',
      contact: {
        name: 'Aidra Support',
        email: 'support@aidra.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://aidra-backend-u8qq.onrender.com'
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server'
          : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
