"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const logger_1 = require("../../utils/logger");
const statuscode_1 = require("../../constants/statuscode");
const messages_1 = require("../../constants/messages");
const redis_1 = require("../../config/redis");
const appError_1 = require("../../utils/appError");
const success_response_1 = require("../../utils/success.response");
const logger = new logger_1.Logger("AuthController");
class AuthController {
    _authService;
    constructor(_authService) {
        this._authService = _authService;
    }
    //send OTP
    register = async (req, res, next) => {
        try {
            const body = req.body;
            logger.debug("Register request received", {
                email: body.email,
                role: body.role,
            });
            await this._authService.initiateRegister(body);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.OTP.SENT_SUCCESS, { email: body.email }).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    // verify OTP
    verifyOtp = async (req, res, next) => {
        try {
            const data = req.body;
            logger.debug("controller verify otp email", {
                email: data.email,
                purpose: data.purpose,
            });
            await this._authService.verifyOtp(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.OTP.VERIFIED_SUCCESS).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    resendOtp = async (req, res, next) => {
        try {
            const data = req.body;
            logger.debug("controller resend otp email", {
                email: data.email,
                purpose: data.purpose,
            });
            await this._authService.resendOtp(data);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.OTP.RESENT_SUCCESS).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    // final register
    completeRegister = async (req, res, next) => {
        try {
            const body = req.body;
            logger.debug("controller complete register email", {
                email: body.email,
                role: body.role,
            });
            const purpose = body.role === "trainer" ? "TRAINER_REGISTER" : "USER_REGISTER";
            const redisKey = `otp_verified:${purpose}:${body.email}`;
            logger.debug("controller complete register redis key", { redisKey });
            const verified = await redis_1.redis.get(redisKey);
            logger.debug("controller complete register otp verified", {
                verified: Boolean(verified),
            });
            if (!verified) {
                throw new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.OTP.OTP_NOT_VERIFIED);
            }
            const user = await this._authService.register(body);
            await redis_1.redis.del(redisKey);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.CREATED, messages_1.MESSAGES.REGISTER.SUCCESS, user).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    //Login
    login = async (req, res, next) => {
        try {
            const body = req.body;
            const { response: loginResponse, refreshToken } = await this._authService.login(body);
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.LOGIN.SUCCESS, loginResponse).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            const result = await this._authService.forgotPassword({ email });
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.PASSWORD.RESET_EMAIL_SENT, { role: result.role }).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    refreshToken = async (req, res, next) => {
        try {
            const cookies = req.cookies;
            const refreshToken = cookies?.refreshToken;
            if (!refreshToken) {
                throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.REFRESH_TOKEN_MISSING);
            }
            const result = await this._authService.refreshAccessToken(refreshToken);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.TOKEN.REFRESH_SUCCESS, result).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    logout = async (req, res, next) => {
        try {
            const cookies = req.cookies;
            const refreshToken = cookies?.refreshToken;
            if (refreshToken) {
                await this._authService.logout(refreshToken);
            }
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.LOGIN.LOGOUT_SUCCESS).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            const body = req.body;
            const { purpose } = body;
            if (purpose !== "FORGET_PASSWORD") {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.PASSWORD.INVALID_RESET_PURPOSE);
            }
            await this._authService.resetPassword(body);
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.PASSWORD.RESET_SUCCESS).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
    googleLogin = async (req, res, next) => {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.LOGIN.GOOGLE_TOKEN_REQUIRED);
            }
            const { response: loginResponse, refreshToken } = await this._authService.googleLogin({ idToken });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            new success_response_1.SuccessResponse(statuscode_1.STATUS.OK, messages_1.MESSAGES.LOGIN.GOOGLE_LOGIN_SUCCESS, loginResponse).send(res);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
}
exports.AuthController = AuthController;
