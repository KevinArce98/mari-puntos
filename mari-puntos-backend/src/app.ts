import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware';

export const createApp = (): Application => {
  const app = express();

  // Security middleware - Disable CSP for Swagger UI
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: config.isDevelopment
        ? '*'
        : process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    })
  );

  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MariPuntos API Documentation',
  }));

  // Swagger JSON
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API routes
  app.use('/api', routes);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Welcome to MariPuntos API',
      version: '1.0.0',
      documentation: '/api-docs',
      apiDocs: '/api-docs.json',
    });
  });

  // 404 handler
  app.use(notFoundMiddleware);

  // Error handler (must be last)
  app.use(errorMiddleware);

  return app;
};
