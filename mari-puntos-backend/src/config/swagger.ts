import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MariPuntos API',
      version: '1.0.0',
      description: 'Gamified relationship points system API - A professional backend for couples to track actions, award points, manage permissions, and redeem rewards.',
      contact: {
        name: 'MariPuntos Team',
        email: 'support@maripuntos.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: config.isDevelopment
          ? `http://localhost:${config.port}/api`
          : 'https://api.maripuntos.com/api',
        description: config.isDevelopment ? 'Development server' : 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Clerk JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            avatarUrl: {
              type: 'string',
              format: 'uri',
            },
            role: {
              type: 'string',
              enum: ['husband', 'wife'],
            },
            totalPoints: {
              type: 'integer',
            },
            currentLevel: {
              type: 'integer',
            },
            pointsInCurrentLevel: {
              type: 'integer',
            },
            partnerCode: {
              type: 'string',
            },
            hasPartner: {
              type: 'boolean',
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Action: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            category: {
              type: 'string',
              enum: ['household', 'childcare', 'errands', 'romantic', 'personal_growth', 'other'],
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
            },
            pointsAwarded: {
              type: 'integer',
            },
            approvedBy: {
              type: 'string',
              format: 'uuid',
            },
            approvedAt: {
              type: 'string',
              format: 'date-time',
            },
            rejectionReason: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Permission: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            requesterId: {
              type: 'string',
              format: 'uuid',
            },
            approverId: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            type: {
              type: 'string',
              enum: ['night_out', 'gaming_session', 'sports_event', 'friends_hangout', 'hobby_time', 'other'],
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'expired'],
            },
            requestedDate: {
              type: 'string',
              format: 'date-time',
            },
            durationHours: {
              type: 'integer',
            },
            pointsCost: {
              type: 'integer',
            },
            respondedAt: {
              type: 'string',
              format: 'date-time',
            },
            responseMessage: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Reward: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            category: {
              type: 'string',
              enum: ['personal_time', 'entertainment', 'gifts', 'experiences', 'privileges', 'other'],
            },
            pointsCost: {
              type: 'integer',
            },
            requiredLevel: {
              type: 'integer',
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
            },
            isActive: {
              type: 'boolean',
            },
            isCustom: {
              type: 'boolean',
            },
            timesRedeemed: {
              type: 'integer',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              example: 10,
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'API health check endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Partner',
        description: 'Partner linking endpoints',
      },
      {
        name: 'Actions',
        description: 'Action management endpoints',
      },
      {
        name: 'Permissions',
        description: 'Permission request endpoints',
      },
      {
        name: 'Rewards',
        description: 'Reward management endpoints',
      },
      {
        name: 'Points',
        description: 'Points and leaderboard endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
