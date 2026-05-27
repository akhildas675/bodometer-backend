"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const google_1 = require("../../config/google");
const messages_1 = require("../../constants/messages");
const roles_1 = require("../../constants/roles");
const statuscode_1 = require("../../constants/statuscode");
const auth_mappers_1 = require("../../mappers/auth/auth.mappers");
const appError_1 = require("../../utils/appError");
const jwt_utils_1 = require("../../utils/jwt.utils");
const password_1 = require("../../utils/password");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    _userRepo;
    _otpService;
    _sessionService;
    _trainerProfileRepo;
    _userSubscriptionRepo;
    _answerRepo;
    constructor(_userRepo, _otpService, _sessionService, _trainerProfileRepo, _userSubscriptionRepo, _answerRepo) {
        this._userRepo = _userRepo;
        this._otpService = _otpService;
        this._sessionService = _sessionService;
        this._trainerProfileRepo = _trainerProfileRepo;
        this._userSubscriptionRepo = _userSubscriptionRepo;
        this._answerRepo = _answerRepo;
    }
    async initiateRegister(data) {
        if (data.role === roles_1.ROLES.ADMIN) {
            throw new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.REGISTER.ADMIN_NOT_ALLOWED);
        }
        if (![roles_1.ROLES.USER, roles_1.ROLES.TRAINER].includes(data.role)) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.REGISTER.INVALID_ROLE);
        }
        const existing = await this._userRepo.findByEmail(data.email.toLowerCase().trim());
        if (existing) {
            throw new appError_1.AppError(statuscode_1.STATUS.CONFLICT, messages_1.MESSAGES.REGISTER.EMAIL_EXISTS);
        }
        const otpPurpose = data.role === roles_1.ROLES.TRAINER ? "TRAINER_REGISTER" : "USER_REGISTER";
        await this._otpService.generateAndSendOtp({
            email: data.email,
            purpose: otpPurpose,
        });
    }
    async verifyOtp(data) {
        await this._otpService.verifyOtp(data);
    }
    async resendOtp(data) {
        await this._otpService.generateAndSendOtp({
            email: data.email,
            purpose: data.purpose,
        });
    }
    async register(data) {
        const hashedPassword = await (0, password_1.hashPassword)(data.password);
        const normalizedEmail = data.email.toLowerCase().trim();
        const baseUsername = normalizedEmail.split("@")[0];
        if (!baseUsername) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.REGISTER.INVALID_EMAIL_FORMAT);
        }
        let userName = baseUsername;
        let counter = 1;
        while (await this._userRepo.findByUsername(userName)) {
            userName = `${baseUsername}${counter++}`;
        }
        const user = await this._userRepo.create({
            name: data.name.trim(),
            userName,
            email: normalizedEmail,
            phoneNumber: data.phoneNumber,
            password: hashedPassword,
            role: data.role,
            isVerified: true,
            isBlocked: false,
        });
        return auth_mappers_1.AuthMapper.toRegisterResponse(user);
    }
    async login(data) {
        const user = await this._userRepo.findByEmail(data.email.toLowerCase().trim());
        if (!user)
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.LOGIN.INVALID_CREDENTIALS);
        const match = await bcrypt_1.default.compare(data.password, user.password);
        if (!match)
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.LOGIN.INVALID_CREDENTIALS);
        if (user.isBlocked) {
            throw new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.LOGIN.ACCOUNT_BLOCKED);
        }
        let trainerStatus;
        if (user.role === roles_1.ROLES.TRAINER) {
            const trainerProfile = await this._trainerProfileRepo.findByUserId(user.id);
            trainerStatus = !trainerProfile
                ? { profileExists: false }
                : {
                    profileExists: true,
                    verificationStatus: trainerProfile.verificationStatus,
                    rejectionReason: trainerProfile.rejectionReason ?? null,
                };
        }
        let onboardingComplete;
        let hasActiveSubscription;
        if (user.role === roles_1.ROLES.USER) {
            const [activeSub, userAnswers] = await Promise.all([
                this._userSubscriptionRepo.findActiveByUserId(user.id),
                this._answerRepo.getUserAnswers(user.id),
            ]);
            hasActiveSubscription = !!activeSub;
            onboardingComplete = userAnswers?.completed ?? false;
        }
        /* ---------- TOKENS ---------- */
        const accessToken = jwt_utils_1.Jwt.signAccess({ sub: user.id, role: user.role });
        const refreshToken = await this._sessionService.createRefreshToken(user.id, {
            id: user.id,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
        });
        let profile = null;
        if (user.role === roles_1.ROLES.TRAINER) {
            profile = await this._trainerProfileRepo.findByUserId(user.id);
        }
        return {
            response: auth_mappers_1.AuthMapper.toLoginResponse(user, accessToken, trainerStatus, onboardingComplete, hasActiveSubscription, profile),
            refreshToken,
        };
    }
    async googleLogin({ idToken }) {
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        if (!GOOGLE_CLIENT_ID) {
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, messages_1.MESSAGES.COMMON.GOOGLE_CLIENT_ID_MISSING);
        }
        const ticket = await google_1.googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.email_verified) {
            throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.LOGIN.INVALID_GOOGLE_TOKEN);
        }
        const email = payload.email.toLowerCase().trim();
        const user = await this._userRepo.findByEmail(email);
        if (!user)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.REGISTER.NO_ACCOUNT_FOUND);
        if (user.isBlocked)
            throw new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.LOGIN.ACCOUNT_BLOCKED);
        let onboardingComplete;
        let hasActiveSubscription;
        if (user.role === roles_1.ROLES.USER) {
            const [activeSub, userAnswers] = await Promise.all([
                this._userSubscriptionRepo.findActiveByUserId(user.id),
                this._answerRepo.getUserAnswers(user.id),
            ]);
            hasActiveSubscription = !!activeSub;
            onboardingComplete = userAnswers?.completed ?? false;
        }
        const accessToken = jwt_utils_1.Jwt.signAccess({ sub: user.id, role: user.role });
        const refreshToken = await this._sessionService.createRefreshToken(user.id, {
            id: user.id,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
        });
        let profile = null;
        let trainerStatus = undefined;
        if (user.role === roles_1.ROLES.TRAINER) {
            profile = await this._trainerProfileRepo.findByUserId(user.id);
            trainerStatus = !profile
                ? { profileExists: false }
                : {
                    profileExists: true,
                    verificationStatus: profile.verificationStatus,
                    rejectionReason: profile.rejectionReason ?? null,
                };
        }
        return {
            response: auth_mappers_1.AuthMapper.toLoginResponse(user, accessToken, trainerStatus, onboardingComplete, hasActiveSubscription, profile),
            refreshToken,
        };
    }
    async refreshAccessToken(refreshToken) {
        if (!refreshToken) {
            throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.REFRESH_TOKEN_INVALID);
        }
        const userId = await this._sessionService.findUserByRefreshToken(refreshToken);
        if (!userId)
            throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.REFRESH_TOKEN_INVALID);
        const isValid = await this._sessionService.validateRefreshToken(userId, refreshToken);
        if (!isValid)
            throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.TOKEN.REFRESH_TOKEN_INVALID);
        const sessionData = await this._sessionService.getUserSessionData(userId);
        if (!sessionData || sessionData.isBlocked) {
            throw new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.LOGIN.SESSION_EXPIRED);
        }
        const user = await this._userRepo.findById(userId);
        if (!user)
            throw new appError_1.AppError(statuscode_1.STATUS.UNAUTHORIZED, messages_1.MESSAGES.USER.USER_NOT_FOUND);
        let onboardingComplete;
        let hasActiveSubscription;
        if (user.role === roles_1.ROLES.USER) {
            const [activeSub, userAnswers] = await Promise.all([
                this._userSubscriptionRepo.findActiveByUserId(user.id),
                this._answerRepo.getUserAnswers(user.id),
            ]);
            hasActiveSubscription = !!activeSub;
            onboardingComplete = userAnswers?.completed ?? false;
        }
        let profile = null;
        let trainerStatus = undefined;
        if (user.role === roles_1.ROLES.TRAINER) {
            profile = await this._trainerProfileRepo.findByUserId(user.id);
            trainerStatus = !profile
                ? { profileExists: false }
                : {
                    profileExists: true,
                    verificationStatus: profile.verificationStatus,
                    rejectionReason: profile.rejectionReason ?? null,
                };
        }
        const accessToken = jwt_utils_1.Jwt.signAccess({ sub: user.id, role: user.role });
        return auth_mappers_1.AuthMapper.toLoginResponse(user, accessToken, trainerStatus, onboardingComplete, hasActiveSubscription, profile);
    }
    async logout(refreshToken) {
        await this._sessionService.deleteSession(refreshToken);
    }
    async forgotPassword(data) {
        const email = data.email.toLowerCase().trim();
        const user = await this._userRepo.findByEmail(email);
        if (!user) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.USER.USER_NOT_FOUND);
        }
        await this._otpService.generateAndSendOtp({
            email,
            purpose: "FORGET_PASSWORD",
        });
        return { role: user.role };
    }
    async resetPassword(data) {
        const normalizedEmail = data.email.toLowerCase().trim();
        const isVerified = await this._sessionService.isOtpVerified("FORGET_PASSWORD", normalizedEmail);
        if (!isVerified)
            throw new appError_1.AppError(statuscode_1.STATUS.FORBIDDEN, messages_1.MESSAGES.OTP.OTP_NOT_VERIFIED);
        const user = await this._userRepo.findByEmail(normalizedEmail);
        if (!user)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.USER.USER_NOT_FOUND);
        const match = await bcrypt_1.default.compare(data.password, user.password);
        if (match)
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.PASSWORD.NEW_PASSWORD_SAME_AS_OLD);
        const hashedPassword = await (0, password_1.hashPassword)(data.password);
        await this._userRepo.updatePassword(user.id, hashedPassword);
        await this._sessionService.clearOtpVerification("FORGET_PASSWORD", normalizedEmail);
    }
}
exports.AuthService = AuthService;
