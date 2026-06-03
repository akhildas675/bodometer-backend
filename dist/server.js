"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const appError_1 = require("./utils/appError");
const statuscode_1 = require("./constants/statuscode");
const messages_1 = require("./constants/messages");
const logger_config_1 = __importDefault(require("./config/logger.config"));
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.COMMON.MONGO_URI_ERROR);
}
const mongoUri = MONGO_URI;
async function start() {
    try {
        await (0, db_1.connectDB)(mongoUri);
        (0, redis_1.connectRedis)();
        app_1.default.listen(PORT, () => {
            logger_config_1.default.info(`Server running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error("Server failed to start:", err);
        process.exit(1);
    }
}
start();
