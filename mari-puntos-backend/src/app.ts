import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware';
import { rateLimitMiddleware } from './middlewares/rateLimitMiddleware';
import routes from './routes';
import webhooksRoutes from './routes/webhooks.routes';
import { httpLogger } from './utils/logger';

export const createApp = (): Application => {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: config.isDevelopment ? false : true,
      hsts: config.isProduction
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
    })
  );

  app.use(
    cors({
      origin: config.isDevelopment ? '*' : config.app.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(
    '/api/webhooks',
    express.raw({ type: 'application/json', limit: '1mb' }),
    webhooksRoutes
  );

  app.use((req, _res, next) => {
    const isProfileUpdate = req.method === 'PUT' && req.path === '/api/users/profile';
    express.json({ limit: isProfileUpdate ? '10mb' : '100kb' })(req, _res, next);
  });
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  app.use(
    pinoHttp({
      logger: httpLogger,
      autoLogging: config.isDevelopment
        ? true
        : {
            ignore: (req) => req.url?.includes('/health') || req.method === 'OPTIONS',
          },
      customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 400 && err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customSuccessMessage: (req, res) => {
        if (res.statusCode >= 400) return `${req.method} ${req.url} - ${res.statusCode}`;
        return `${req.method} ${req.url} - ${res.statusCode}`;
      },
      customErrorMessage: (req, res, err) =>
        `${req.method} ${req.url} - ${res.statusCode} - ${err?.message || 'Unknown error'}`,
    })
  );

  app.use(rateLimitMiddleware);

  if (config.isDevelopment) {
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'MariPuntos API Documentation',
      })
    );

    app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  app.use('/api', routes);

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome to MariPuntos API',
      version: '1.0.0',
      ...(config.isDevelopment && {
        documentation: '/api-docs',
        apiDocs: '/api-docs.json',
      }),
    });
  });

  app.use(notFoundMiddleware);

  app.use(errorMiddleware);

  return app;
};
