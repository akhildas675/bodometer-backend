import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

// dev logger with pretty
const developmentLogger = pino({
  level: process.env.LOG_LEVEL || "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname",
    },
  },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});

// production logger
const productionLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});


const logger = isDevelopment ? developmentLogger : productionLogger;

export default logger;