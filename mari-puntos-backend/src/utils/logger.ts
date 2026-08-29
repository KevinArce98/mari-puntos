import pino from 'pino';

import { config } from '../config/env';

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

export const logger = pino(loggerConfig);

export const httpLogger = pino({
  ...loggerConfig,
  level: config.isDevelopment ? 'info' : 'warn',
});
