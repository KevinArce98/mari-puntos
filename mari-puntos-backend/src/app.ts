import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware';
import { rateLimitMiddleware } from './middlewares/rateLimitMiddleware';

export const createApp = (): Application => {
  const app = express();

  // Disable x-powered-by header
  app.disable('x-powered-by');

  // Security middleware
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

  // CORS configuration
  app.use(
    cors({
      origin: config.isDevelopment ? '*' : config.app.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parser middleware with size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    // Use combined format but don't log sensitive headers
    app.use(
      morgan('combined', {
        skip: (_req, res) => res.statusCode < 400, // Only log errors in production
      })
    );
  }

  // Rate limiting (apply to all routes)
  app.use(rateLimitMiddleware);

  // Swagger documentation - ONLY in development
  if (config.isDevelopment) {
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'MariPuntos API Documentation',
      })
    );

    // Swagger JSON
    app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  // API routes
  app.use('/api', routes);

  // Root endpoint
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

  // 404 handler
  app.use(notFoundMiddleware);

  // Error handler (must be last)
  app.use(errorMiddleware);

  return app;
};
