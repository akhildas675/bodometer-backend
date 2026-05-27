"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const logger_config_1 = __importDefault(require("../config/logger.config"));
const httpLogger = (req, res, next) => {
    const start = Date.now();
    // Log when response finishes
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger_config_1.default.info({
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        }, `${req.method} ${req.url}`);
    });
    next();
};
exports.httpLogger = httpLogger;
