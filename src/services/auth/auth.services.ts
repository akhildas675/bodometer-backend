import { googleClient } from "../../config/google";
import { redis } from "../../config/redis";
import { ROLES } from "../../constants/identity.constants";
import { STATUS } from "../../constants/statuscode";
import { ForgotPasswordResponseDto, GoogleLoginDto, LoginDto, LoginResponseDto, RegisterDto, RegisterResponseDto, resetPasswordDto } from "../../dto/auth/auth.dto";
import { ResendOtpDto, VerifyOtpDto } from "../../dto/otp/otp.dto";
import { AuthServiceInterface } from "../../interfaces/auth/auth-service.interface";
import AuthRepository from "../../repositories/auth/auth.repository";
import { AppError } from "../../utils/appError";
import { Jwt } from "../../utils/jwt.utils";
import { hashPassword } from "../../utils/password";
import { OtpService } from "../otp/otp.services";
import bcrypt from "bcrypt"
import crypto from "crypto"

export class AuthService implements AuthServiceInterface {
    constructor(
        private authRepo: AuthRepository,
        private otpService: OtpService
    ) { }


    async initiateRegister(data: RegisterDto): Promise<void> {

        const role = data.role;

        if (role == ROLES.ADMIN) {
            throw new AppError(403, "Admin register is not allowed")
        }

        if (![ROLES.USER, ROLES.TRAINER].includes(role)) {
            throw new AppError(400, "Invalid role for registration")
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


    //otp verify

    async verifyOtp(data: VerifyOtpDto): Promise<void> {
        await this.otpService.verifyOtp(data);
    }

    async resendOtp(data: ResendOtpDto): Promise<void> {
        await this.otpService.generateAndSendOtp({
            email: data.email,
            purpose: data.purpose
        });
    }

    async register(data: RegisterDto): Promise<RegisterResponseDto> {
        console.log("The data from register service", data)
        const role = data.role;
        const hashedPassword = await hashPassword(data.password);

        const normalizedEmail = data.email.toLowerCase().trim();
        const baseUsername = normalizedEmail.split("@")[0];

        if (!baseUsername) {
            throw new AppError(400, "Invalid email format")
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
            id: ""
        });

        return {
            id: user.id!,
            name: user.name,
            email: user.email,
            userName: user.userName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profilePic: user.profilePic ?? null
        }
    }

    async login(data: LoginDto): Promise<LoginResponseDto> {
        const { email, password } = data;

        console.log("Login data in service", data)

        const user = await this.authRepo.findByEmail(email.toLowerCase().trim());
        if (!user) {
            throw new AppError(STATUS.UNAUTHORIZED, "Invalid credentials");
        }

        if (user.isBlocked) {
            throw new AppError(STATUS.FORBIDDEN, "Account is blocked");
        }

        if (!user.isVerified) {
            throw new AppError(STATUS.FORBIDDEN, "Account not verified");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError(STATUS.UNAUTHORIZED, "Invalid credentials");
        }

        //Access token
        const accessToken = Jwt.signAccess({
            sub: user.id,
            role: user.role,
        });


        const refreshToken = crypto.randomUUID();

        await redis.set(
            `refresh:${user.id}`,
            refreshToken,
            "EX",
            60 * 60 * 24 * 7
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                name: user.name,
            },
            accessToken,
            refreshToken,
        };
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

    async resetPassword(data:resetPasswordDto): Promise<void> {
        const normalizedEmail = data.email.toLowerCase().trim();

        const redisKey = `otp_verified:FORGET_PASSWORD:${normalizedEmail}`;
        const verified = await redis.get(redisKey);

        if (!verified) {
            throw new AppError(STATUS.FORBIDDEN, "OTP not verified");
        }

        const user = await this.authRepo.findByEmail(normalizedEmail);

        if (!user) {
            throw new AppError(STATUS.NOT_FOUND, "User not found");
        }

        const hashedPassword = await hashPassword(data.password);

        await this.authRepo.updatePassword(user.id!, hashedPassword);

        await redis.del(redisKey);
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

  const refreshToken = crypto.randomUUID();

  await redis.set(
    `refresh:${user.id}`,
    refreshToken,
    "EX",
    60 * 60 * 24 * 7
  );

  return {
    user: {
      id: user.id!,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      name: user.name,
    },
    accessToken,
    refreshToken,
  };
}




}