const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API KOCC - Système Intelligent de Gestion Pédagogique',
      version: '1.0.0',
      description: "Documentation interactive des API REST de l'application KOCC pour ISI SUPTECH avec l'assistant IA MBENE.",
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de développement local (Express)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
