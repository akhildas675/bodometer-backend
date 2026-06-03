"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const isDevelopment = process.env.NODE_ENV !== "production";
// dev logger with pretty
const developmentLogger = (0, pino_1.default)({
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
const productionLogger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || "info",
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
});
const logger = isDevelopment ? developmentLogger : productionLogger;
exports.default = logger;
