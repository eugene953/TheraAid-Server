const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TheraAid API',
      version: '1.0.0',
      description:
        'API documentation for the TheraAid Mental Health Support Application',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './index.ts'],
};

export default options;
