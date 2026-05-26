"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = void 0;
const user_model_1 = require("../models/user.model");
const appError_1 = require("../utils/appError");
const statuscode_1 = require("../constants/statuscode");
const messages_1 = require("../constants/messages");
const redis_1 = require("../config/redis");
const jwt_utils_1 = require("../utils/jwt.utils");
const authGuard = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            const accessToken = authHeader?.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : null;
            if (accessToken) {
                try {
                    const payload = jwt_utils_1.Jwt.verifyAccess(accessToken);
                    const user = await user_model_1.UserModel.findById(payload.sub).select("isBlocked role");
                    if (!user) {
                        return next(new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND));
                    }
                    if (user.isBlocked) {
                        await redis_1.redis.del(`refresh:${payload.sub}`);
                        res.clearCookie("refreshToken");
                        return next(new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.LOGIN.ACCOUNT_BLOCKED));
                    }
                    if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
                        return next(new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.COMMON.ACCESS_DENIED));
                    }
                    req.user = { id: payload.sub, role: payload.role };
                    return next();
                }
                catch {
                    // Access token invalid/expired, fall through to refresh token validation
                }
            }
            return await handleRefresh(req, res, next, allowedRoles);
        }
        catch (error) {
            if (error instanceof Error) {
                return next(error);
            }
            else {
                return next(new Error("Unknown error occurred"));
            }
        }
    };
};
exports.authGuard = authGuard;
async function handleRefresh(req, res, next, allowedRoles) {
    const cookies = req.cookies;
    const refreshToken = cookies?.refreshToken;
    if (!refreshToken) {
        return next(new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.AUTHENTICATION_REQUIRED));
    }
    try {
        const payload = jwt_utils_1.Jwt.verifyRefresh(refreshToken);
        const storedToken = await redis_1.redis.get(`refresh:${payload.sub}`);
        if (!storedToken || storedToken !== refreshToken) {
            return next(new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.REFRESH_TOKEN_EXPIRED));
        }
        if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
            return next(new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.COMMON.ACCESS_DENIED));
        }
        const newAccessToken = jwt_utils_1.Jwt.signAccess({
            sub: payload.sub,
            role: payload.role,
        });
        res.setHeader("x-access-token", newAccessToken);
        req.user = { id: payload.sub, role: payload.role };
        return next();
    }
    catch {
        return next(new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.REFRESH_TOKEN_EXPIRED));
    }
}
