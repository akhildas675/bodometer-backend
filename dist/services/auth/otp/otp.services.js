"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const generateOtp_1 = require("../../../utils/generateOtp");
const redis_1 = require("../../../config/redis");
const messages_1 = require("../../../constants/messages");
const statuscode_1 = require("../../../constants/statuscode");
const appError_1 = require("../../../utils/appError");
class OtpService {
    _mailService;
    constructor(_mailService) {
        this._mailService = _mailService;
    }
    OTP_TTL = 300;
    MAX_ATTEMPTS = 5;
    otpKey(email, purpose) {
        return `otp:${purpose}:${email}`;
    }
    attemptsKey(email, purpose) {
        return `otp_attempts:${purpose}:${email}`;
    }
    async generateAndSendOtp({ email, purpose, }) {
        const otp = (0, generateOtp_1.generateOtp)(6);
        console.log("Otp....", otp);
        await redis_1.redis.set(this.otpKey(email, purpose), otp, "EX", this.OTP_TTL);
        await redis_1.redis.del(this.attemptsKey(email, purpose));
        await this._mailService.sendOtpEmail(email, otp);
    }
    async verifyOtp({ email, otp, purpose }) {
        const otpKey = this.otpKey(email, purpose);
        const attemptsKey = this.attemptsKey(email, purpose);
        const verifiedKey = `otp_verified:${purpose}:${email}`;
        const storedOtp = await redis_1.redis.get(otpKey);
        console.log("Stored Otp", storedOtp);
        if (!storedOtp) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.OTP.INVALID_OTP);
        }
        const attempts = await redis_1.redis.incr(attemptsKey);
        if (attempts > this.MAX_ATTEMPTS) {
            await redis_1.redis.del(otpKey);
            await redis_1.redis.del(attemptsKey);
            throw new appError_1.AppError(statuscode_1.STATUS.TOO_MANY_REQUESTS, messages_1.MESSAGES.OTP.TOO_MANY_OTP_REQUESTS);
        }
        if (storedOtp !== otp) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.OTP.INVALID_OTP);
        }
        await redis_1.redis.set(verifiedKey, "true", "EX", 10 * 60);
        // cleanup OTP
        await redis_1.redis.del(otpKey);
        await redis_1.redis.del(attemptsKey);
    }
}
exports.OtpService = OtpService;
