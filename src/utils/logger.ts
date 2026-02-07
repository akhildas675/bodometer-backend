import logger from "../config/logger.config";

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: Record<string, unknown>) {
    logger.info({ context: this.context, ...data }, message);
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    if (error instanceof Error) {
      logger.error(
        {
          context: this.context,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          ...data,
        },
        message
      );
    } else {
      logger.error({ context: this.context, error, ...data }, message);
    }
  }

  warn(message: string, data?: Record<string, unknown>) {
    logger.warn({ context: this.context, ...data }, message);
  }

  debug(message: string, data?: Record<string, unknown>) {
    logger.debug({ context: this.context, ...data }, message);
  }
}

export default logger;