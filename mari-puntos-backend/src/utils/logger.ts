import pino from 'pino';
import { config } from '../config/env';

// Configuración del logger
const loggerConfig = {
  level: config.isDevelopment ? 'debug' : 'info',
  ...(config.isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
};

// Crear instancia de logger
export const logger = pino(loggerConfig);

// Logger para HTTP requests (usado con pino-http)
export const httpLogger = pino({
  ...loggerConfig,
  level: config.isDevelopment ? 'info' : 'warn', // Menos verboso para HTTP
});