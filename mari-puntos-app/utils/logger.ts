import * as Sentry from '@sentry/react-native';
import { consoleTransport, logger } from 'react-native-logs';

/**
 * Logger configuration for the app
 *
 * In development:
 * - Logs to console with colors and timestamps
 * - All log levels enabled (debug, info, warn, error)
 *
 * In production:
 * - Only warn and error logs to console
 * - Errors automatically sent to Sentry
 * - Debug and info logs disabled for performance
 */

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: __DEV__ ? 'debug' : 'warn', // In dev: all logs, in prod: only warn/error
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

/**
 * Custom logger that integrates with Sentry
 * Automatically sends error logs to Sentry in production
 */
const customLogger = {
  debug: (message: string, ...args: any[]) => {
    log.debug(message, ...args);
  },

  info: (message: string, ...args: any[]) => {
    log.info(message, ...args);
  },

  warn: (message: string, ...args: any[]) => {
    log.warn(message, ...args);
    if (!__DEV__) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: args.length > 0 ? { data: args } : undefined,
      });
    }
  },

  error: (message: string, error?: Error | any, ...args: any[]) => {
    log.error(message, error, ...args);

    // Send errors to Sentry
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
  },
};

export default customLogger;
