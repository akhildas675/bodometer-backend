"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const redis_1 = require("../../../config/redis");
class SessionService {
    REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7;
    OTP_VERIFIED_TTL = 60 * 10;
    // Refresh Token Operations
    async createRefreshToken(userId, userData) {
        const refreshToken = crypto.randomUUID();
        await redis_1.redis.set(`refresh:${userId}`, refreshToken, "EX", this.REFRESH_TOKEN_TTL);
        await redis_1.redis.set(`user:${userId}`, JSON.stringify(userData), "EX", this.REFRESH_TOKEN_TTL);
        return refreshToken;
    }
    async findUserByRefreshToken(refreshToken) {
        const keys = await redis_1.redis.keys("refresh:*");
        for (const key of keys) {
            const storedToken = await redis_1.redis.get(key);
            if (storedToken === refreshToken) {
                return key.replace("refresh:", "");
            }
        }
        return null;
    }
    async validateRefreshToken(userId, refreshToken) {
        const storedToken = await redis_1.redis.get(`refresh:${userId}`);
        return storedToken === refreshToken;
    }
    async getUserSessionData(userId) {
        const userData = await redis_1.redis.get(`user:${userId}`);
        return userData ? JSON.parse(userData) : null;
    }
    async deleteSession(refreshToken) {
        const keys = await redis_1.redis.keys("refresh:*");
        for (const key of keys) {
            const storedToken = await redis_1.redis.get(key);
            if (storedToken === refreshToken) {
                const userId = key.replace("refresh:", "");
                await redis_1.redis.del(key);
                await redis_1.redis.del(`user:${userId}`);
                break;
            }
        }
    }
    // OTP Verification Tracking
    async markOtpAsVerified(purpose, email) {
        const redisKey = `otp_verified:${purpose}:${email}`;
        await redis_1.redis.set(redisKey, "true", "EX", this.OTP_VERIFIED_TTL);
    }
    async isOtpVerified(purpose, email) {
        const redisKey = `otp_verified:${purpose}:${email}`;
        const verified = await redis_1.redis.get(redisKey);
        return verified === "true";
    }
    async clearOtpVerification(purpose, email) {
        const redisKey = `otp_verified:${purpose}:${email}`;
        await redis_1.redis.del(redisKey);
    }
}
exports.SessionService = SessionService;
