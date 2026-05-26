"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
exports.redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
});
const connectRedis = async () => {
    return new Promise((resolve, reject) => {
        exports.redis.once("connect", () => {
            console.log("Redis connected");
            resolve();
        });
        exports.redis.once("error", (err) => {
            console.error("Redis connection failed:", err);
            reject(err);
        });
    });
};
exports.connectRedis = connectRedis;
