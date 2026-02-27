import { googleClient } from "../../config/google";
import { STATUS } from "../../constants/statuscode";
import {
  ForgotPasswordResponseDto,
  GoogleLoginDto,
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RegisterResponseDto,
  ResetPasswordDto,
} from "../../dto/auth/auth.dto";
import { ResendOtpDto, VerifyOtpDto } from "../../dto/otp/otp.dto";
import { IAuthService } from "../../interfaces/auth/auth-service.interface";
import { AuthMapper } from "../../mappers/auth/auth.mappers";
import { AppError } from "../../utils/appError";
import { Jwt } from "../../utils/jwt.utils";
import { hashPassword } from "../../utils/password";
import bcrypt from "bcrypt";
import { VerificationStatus } from "../../constants/verification.constants";
import { ITrainerProfileRepository } from "../../interfaces/trainer/trainer.profile-repository.interface";
import { IAuthRepository } from "../../interfaces/auth/auth-repository.interface";
import { ISessionService } from "../../interfaces/auth/session-service.interface";
import { IOtpService } from "../../interfaces/otp/otp-service.interface";
import { MESSAGES } from "../../constants/messages";
import { ROLES } from "../../constants/roles";

export class AuthService implements IAuthService {
  constructor(
    private _authRepo: IAuthRepository,
    private _otpService: IOtpService,
    private _sessionService: ISessionService,
    private _trainerProfileRepo: ITrainerProfileRepository,
  ) {}

  async initiateRegister(data: RegisterDto): Promise<void> {
    const role = data.role;

    if (role == ROLES.ADMIN) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.REGISTER.ADMIN_NOT_ALLOWED);
    }

    if (![ROLES.USER, ROLES.TRAINER].includes(role)) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.REGISTER.INVALID_ROLE);
    }

    const existing = await this._authRepo.findByEmail(
      data.email.toLowerCase().trim(),
    );

    if (existing) {
      throw new AppError(STATUS.CONFLICT, MESSAGES.REGISTER.EMAIL_EXISTS);
    }

    const otpPurpose =
      role === ROLES.TRAINER ? "TRAINER_REGISTER" : "USER_REGISTER";

    await this._otpService.generateAndSendOtp({
      email: data.email,
      purpose: otpPurpose,
    });
  }

  async verifyOtp(data: VerifyOtpDto): Promise<void> {
    await this._otpService.verifyOtp(data);
  }

  async resendOtp(data: ResendOtpDto): Promise<void> {
    await this._otpService.generateAndSendOtp({
      email: data.email,
      purpose: data.purpose,
    });
  }

  async register(data: RegisterDto): Promise<RegisterResponseDto> {
    const role = data.role;
    const hashedPassword = await hashPassword(data.password);

    const normalizedEmail = data.email.toLowerCase().trim();
    const baseUsername = normalizedEmail.split("@")[0];

    if (!baseUsername) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.REGISTER.INVALID_EMAIL_FORMAT);
    }

    let userName = baseUsername;
    let counter = 1;

    while (await this._authRepo.findByUsername(userName)) {
      userName = `${baseUsername} ${counter++}`;
    }

    const user = await this._authRepo.create({
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
    const user = await this._authRepo.findByEmail(
      data.email.toLowerCase().trim(),
    );
    if (!user) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.LOGIN.INVALID_CREDENTIALS);

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.LOGIN.INVALID_CREDENTIALS);

    if (user.isBlocked) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.LOGIN.ACCOUNT_BLOCKED);
    }

    let trainerStatus:
      | {
          profileExists: boolean;
          verificationStatus?: VerificationStatus;
          rejectionReason?: string | null;
        }
      | undefined;

    if (user.role === "trainer") {
      const trainerProfile = await this._trainerProfileRepo.findByUserId(
        user.id,
      );

      if (!trainerProfile) {
        trainerStatus = {
          profileExists: false,
        };
      } else {
        trainerStatus = {
          profileExists: true,
          verificationStatus: trainerProfile.verificationStatus,
          rejectionReason: trainerProfile.rejectionReason ?? null,
        };
      }
    }

    const accessToken = Jwt.signAccess({
      sub: user.id,
      role: user.role,
    });

    const refreshToken = await this._sessionService.createRefreshToken(user.id, {
      id: user.id,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    });

    return {
      response: AuthMapper.toLoginResponse(user, accessToken, trainerStatus),
      refreshToken,
    };
  }

  async googleLogin({ idToken }: GoogleLoginDto): Promise<LoginResponseDto> {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    if (!GOOGLE_CLIENT_ID) {
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.COMMON.GOOGLE_CLIENT_ID_MISSING);
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

    const user = await this._authRepo.findByEmail(email);

    if (!user) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.REGISTER.NO_ACCOUNT_FOUND,
      );
    }

    if (user.isBlocked) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.LOGIN.ACCOUNT_BLOCKED);
    }

    const accessToken = Jwt.signAccess({
      sub: user.id!,
      role: user.role,
    });

    const refreshToken = await this._sessionService.createRefreshToken(
      user.id!,
      {
        id: user.id!,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    );

    return AuthMapper.toLoginResponse(user, accessToken);
  }

  async refreshAccessToken(refreshToken: string): Promise<LoginResponseDto> {
    if (!refreshToken) {
      throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.REFRESH_TOKEN_INVALID);
    }

    const userId =
      await this._sessionService.findUserByRefreshToken(refreshToken);
    if (!userId) {
      throw new AppError(
        STATUS.UNAUTHORIZED,
        "Invalid or expired refresh token",
      );
    }

    const isValid = await this._sessionService.validateRefreshToken(
      userId,
      refreshToken,
    );
    if (!isValid) {
      throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.REFRESH_TOKEN_INVALID);
    }

    const sessionData = await this._sessionService.getUserSessionData(userId);
    if (!sessionData || sessionData.isBlocked) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.LOGIN.SESSION_EXPIRED,
      );
    }

    const user = await this._authRepo.findById(userId);
    if (!user) {
      throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
    }

    const accessToken = Jwt.signAccess({
      sub: user.id!,
      role: user.role,
    });

    return AuthMapper.toLoginResponse(user, accessToken);
  }
  async logout(refreshToken: string): Promise<void> {
    await this._sessionService.deleteSession(refreshToken);
  }

  async forgotPassword(data: {
    email: string;
  }): Promise<ForgotPasswordResponseDto> {
    const email = data.email.toLowerCase().trim();

    const user = await this._authRepo.findByEmail(email);

    if (!user) {
      return { role: null };
    }

    await this._otpService.generateAndSendOtp({
      email,
      purpose: "FORGET_PASSWORD",
    });

    return {
      role: user.role,
    };
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    const normalizedEmail = data.email.toLowerCase().trim()
    const isVerified = await this._sessionService.isOtpVerified(
      "FORGET_PASSWORD",
      normalizedEmail,
    );

    if (!isVerified) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.OTP.OTP_NOT_VERIFIED);
    }

    const user = await this._authRepo.findByEmail(normalizedEmail);

    if (!user) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    }

    const match = await bcrypt.compare(data.password,user.password);

    if(match){
      throw new AppError(STATUS.BAD_REQUEST,MESSAGES.PASSWORD.NEW_PASSWORD_SAME_AS_OLD)
    }
  
    const hashedPassword = await hashPassword(data.password);

    await this._authRepo.updatePassword(user.id!, hashedPassword);

    await this._sessionService.clearOtpVerification(
      "FORGET_PASSWORD",
      normalizedEmail,
    );
  }
}
