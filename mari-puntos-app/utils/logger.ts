import * as Sentry from '@sentry/react-native';
import { consoleTransport, logger } from 'react-native-logs';

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: __DEV__ ? 'debug' : 'warn',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: 'blueBright' as const,
      warn: 'yellowBright' as const,
      error: 'redBright' as const,
    },
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  enabled: true,
};

const log = logger.createLogger(config);

function toAttributes(args: any[]): Record<string, unknown> {
  return args.length > 0 ? { data: args } : {};
}

const customLogger = {
  debug: (message: string, ...args: any[]) => {
    log.debug(message, ...args);
  },

  info: (message: string, ...args: any[]) => {
    log.info(message, ...args);
    if (!__DEV__) {
      const attrs = toAttributes(args);
      Sentry.addBreadcrumb({ category: 'app', message, level: 'info', data: attrs });
      Sentry.logger.info(message, attrs);
    }
  },

  warn: (message: string, ...args: any[]) => {
    log.warn(message, ...args);
    if (!__DEV__) {
      const attrs = toAttributes(args);
      Sentry.addBreadcrumb({ category: 'app', message, level: 'warning', data: attrs });
      Sentry.logger.warn(message, attrs);
    }
  },

  error: (message: string, error?: Error | any, ...args: any[]) => {
    log.error(message, error, ...args);

    if (!__DEV__) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          contexts: {
            error_context: {
              message,
              data: args.length > 0 ? args : undefined,
            },
          },
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: {
            error,
            data: args.length > 0 ? args : undefined,
          },
        });
      }
    }
  },
};

export default customLogger;
