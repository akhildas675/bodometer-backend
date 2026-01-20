import { googleClient } from "../../config/google";
import { ROLES } from "../../constants/identity.constants";
import { STATUS } from "../../constants/statuscode";
import {
    ForgotPasswordResponseDto,
    GoogleLoginDto,
    LoginDto,
    LoginResponseDto,
    RegisterDto,
    RegisterResponseDto,
    ResetPasswordDto
} from "../../dto/auth/auth.dto";
import { ResendOtpDto, VerifyOtpDto } from "../../dto/otp/otp.dto";
import { AuthServiceInterface } from "../../interfaces/auth/auth-service.interface";
import { AuthMapper } from "../../mappers/auth/auth.mappers";
import { AppError } from "../../utils/appError";
import { Jwt } from "../../utils/jwt.utils";
import { hashPassword } from "../../utils/password";
import bcrypt from "bcrypt";
import { OtpServiceInterface } from "../../interfaces/otp/otp-service.interface";
import { SessionServiceInterface } from "../../interfaces/auth/session-service.interface";
import AuthRepository from "../../repositories/auth/auth.repository";
import { OtpService } from "./otp/otp.services";
import { SessionService } from "./session/session.services";

export class AuthService implements AuthServiceInterface {
    constructor(
        private authRepo: AuthRepository,
        private otpService: OtpService,
        private sessionService: SessionService,
    ) { }

    async initiateRegister(data: RegisterDto): Promise<void> {
        const role = data.role;

        if (role == ROLES.ADMIN) {
            throw new AppError(403, "Admin register is not allowed");
        }

        if (![ROLES.USER, ROLES.TRAINER].includes(role)) {
            throw new AppError(400, "Invalid role for registration");
        }

        const existing = await this.authRepo.findByEmail(
            data.email.toLowerCase().trim()
        );

        if (existing) {
            throw new AppError(409, "Email already registered");
        }

        const otpPurpose =
            role === ROLES.TRAINER ? "TRAINER_REGISTER" : "USER_REGISTER";

        await this.otpService.generateAndSendOtp({
            email: data.email,
            purpose: otpPurpose,
        });
    }

    async verifyOtp(data: VerifyOtpDto): Promise<void> {
        await this.otpService.verifyOtp(data);
    }

    async resendOtp(data: ResendOtpDto): Promise<void> {
        await this.otpService.generateAndSendOtp({
            email: data.email,
            purpose: data.purpose,
        });
    }

    async register(data: RegisterDto): Promise<RegisterResponseDto> {
        console.log("The data from register service", data);
        const role = data.role;
        const hashedPassword = await hashPassword(data.password);

        const normalizedEmail = data.email.toLowerCase().trim();
        const baseUsername = normalizedEmail.split("@")[0];

        if (!baseUsername) {
            throw new AppError(400, "Invalid email format");
        }

        let userName = baseUsername;
        let counter = 1;

        while (await this.authRepo.findByUsername(userName)) {
            userName = `${baseUsername} ${counter++}`;
        }

        const user = await this.authRepo.create({
            name: data.name.trim(),
            userName: userName,
            email: normalizedEmail,
            phoneNumber: data.phoneNumber,
            password: hashedPassword,
            role: data.role,
            isVerified: true,
            isBlocked: false,
            id: "",
        });

        return AuthMapper.toRegisterResponse(user);
    }

    async login(data: LoginDto): Promise<{
        response: LoginResponseDto;
        refreshToken: string;
    }> {
        const user = await this.authRepo.findByEmail(
            data.email.toLowerCase().trim()
        );
        if (!user) throw new AppError(401, "Invalid credentials");
        console.log("User in Authservice.......", user);

        const match = await bcrypt.compare(data.password, user.password);
        if (!match) throw new AppError(401, "Invalid credentials");

        if (user.isBlocked) {
            throw new AppError(STATUS.FORBIDDEN, "Account is blocked");
        }

        const accessToken = Jwt.signAccess({
            sub: user.id,
            role: user.role,
        });

        const refreshToken = await this.sessionService.createRefreshToken(user.id, {
            id: user.id,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
        });

        return {
            response: AuthMapper.toLoginResponse(user, accessToken),
            refreshToken,
        };
    }

    async googleLogin({ idToken }: GoogleLoginDto): Promise<LoginResponseDto> {
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

        if (!GOOGLE_CLIENT_ID) {
            throw new Error("GOOGLE_CLIENT_ID is not defined");
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.email_verified) {
            throw new AppError(STATUS.UNAUTHORIZED, "Invalid Google token");
        }

        const email = payload.email.toLowerCase().trim();

        const user = await this.authRepo.findByEmail(email);

        if (!user) {
            throw new AppError(
                STATUS.NOT_FOUND,
                "No account found. Please register first."
            );
        }

        if (user.isBlocked) {
            throw new AppError(STATUS.FORBIDDEN, "Account is blocked");
        }

        const accessToken = Jwt.signAccess({
            sub: user.id!,
            role: user.role,
        });

        const refreshToken = await this.sessionService.createRefreshToken(user.id!, {
            id: user.id!,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
        });

        return AuthMapper.toLoginResponse(user, accessToken);
    }

    async refreshAccessToken(refreshToken: string): Promise<LoginResponseDto> {
        if (!refreshToken) {
            throw new AppError(STATUS.UNAUTHORIZED, "Invalid refresh token");
        }

        const userId = await this.sessionService.findUserByRefreshToken(refreshToken);
        if (!userId) {
            throw new AppError(STATUS.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        const isValid = await this.sessionService.validateRefreshToken(userId, refreshToken);
        if (!isValid) {
            throw new AppError(STATUS.UNAUTHORIZED, "Invalid refresh token");
        }

        const sessionData = await this.sessionService.getUserSessionData(userId);
        if (!sessionData || sessionData.isBlocked) {
            throw new AppError(STATUS.FORBIDDEN, "Account is blocked or session expired");
        }

      
        const user = await this.authRepo.findById(userId);
        if (!user) {
            throw new AppError(STATUS.UNAUTHORIZED, "User not found");
        }

        const accessToken = Jwt.signAccess({
            sub: user.id!,
            role: user.role,
        });

        return AuthMapper.toLoginResponse(user, accessToken);
    }
    async logout(refreshToken: string): Promise<void> {
        await this.sessionService.deleteSession(refreshToken);
    }

    async forgotPassword(data: { email: string }): Promise<ForgotPasswordResponseDto> {
        const email = data.email.toLowerCase().trim();

        const user = await this.authRepo.findByEmail(email);

        if (!user) {
            return { role: null };
        }

        await this.otpService.generateAndSendOtp({
            email,
            purpose: "FORGET_PASSWORD",
        });

        return {
            role: user.role,
        };
    }

    async resetPassword(data: ResetPasswordDto): Promise<void> {
        const normalizedEmail = data.email.toLowerCase().trim();

        const isVerified = await this.sessionService.isOtpVerified(
            "FORGET_PASSWORD",
            normalizedEmail
        );

        if (!isVerified) {
            throw new AppError(STATUS.FORBIDDEN, "OTP not verified");
        }

        const user = await this.authRepo.findByEmail(normalizedEmail);

        if (!user) {
            throw new AppError(STATUS.NOT_FOUND, "User not found");
        }

        const hashedPassword = await hashPassword(data.password);

        await this.authRepo.updatePassword(user.id!, hashedPassword);

        await this.sessionService.clearOtpVerification("FORGET_PASSWORD", normalizedEmail);
    }
}