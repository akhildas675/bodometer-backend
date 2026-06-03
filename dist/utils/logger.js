"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const logger_config_1 = __importDefault(require("../config/logger.config"));
class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    info(message, data) {
        logger_config_1.default.info({ context: this.context, ...data }, message);
    }
    error(message, error, data) {
        if (error instanceof Error) {
            logger_config_1.default.error({
                context: this.context,
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                },
                ...data,
            }, message);
        }
        else {
            logger_config_1.default.error({ context: this.context, error, ...data }, message);
        }
    }
    warn(message, data) {
        logger_config_1.default.warn({ context: this.context, ...data }, message);
    }
    debug(message, data) {
        logger_config_1.default.debug({ context: this.context, ...data }, message);
    }
}
exports.Logger = Logger;
exports.default = logger_config_1.default;
