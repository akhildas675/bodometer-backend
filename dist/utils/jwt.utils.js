"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Jwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets are missing in environment variables");
}
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
exports.Jwt = {
    signAccess(payload) {
        const expiresIn = (process.env.ACCESS_TOKEN_EXPIRES ||
            "15m");
        const options = { expiresIn };
        return jsonwebtoken_1.default.sign(payload, accessSecret, options);
    },
    signRefresh(payload) {
        const expiresIn = (process.env.REFRESH_TOKEN_EXPIRES ||
            "7d");
        const options = { expiresIn };
        return jsonwebtoken_1.default.sign(payload, refreshSecret, options);
    },
    verifyAccess(token) {
        return jsonwebtoken_1.default.verify(token, accessSecret);
    },
    verifyRefresh(token) {
        return jsonwebtoken_1.default.verify(token, refreshSecret);
    },
};
