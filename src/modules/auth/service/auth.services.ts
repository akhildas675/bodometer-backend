import { googleClient } from "../../../config/google";
import { MESSAGES } from "../../../constants/messages";
import { ROLES } from "../../../constants/constant.values.ts/roles";
import { STATUS } from "../../../constants/constant.values.ts/statuscode";
import { VerificationStatus } from "../../../constants/constant.values.ts/verification.constants";
import {
  ForgotPasswordResponseDto,
  GoogleLoginDto,
  GoogleLoginResponseDto,
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RegisterResponseDto,
  ResetPasswordDto,
} from "../dto/auth.dto";
import { ResendOtpDto, VerifyOtpDto } from "../../../dto/otp/otp.dto";
import { ITrainerProfileRepository } from '@/modules/trainer/interface/trainer.profile-repository.interface';
import { IUserRepository } from '@/modules/user/interface/user-repository.interface';
import { IUserSubscriptionRepository } from "../../subscription/interface/repository.interface/user.subscription.repository.interface";
import { IAnswerRepository } from "../../onboarding/interface/repository.interface/answer-repository.interface";
import { IAuthService } from "../interface/auth-service.interface";
import { ISessionService } from "../interface/session-service.interface";
import { IOtpService } from '@/modules/otp/interface/otp-service.interface';

import { AppError } from "../../../utils/appError";
import { Jwt } from "../../../utils/jwt.utils";
import { hashPassword } from "../../../utils/password";
import bcrypt from "bcrypt";
import { AuthMapper } from "../mapper/auth.mappers";
import { inject, injectable } from "inversify";
import { AUTH_TYPES } from "../auth.types";
import { USER_TYPES } from "@/modules/user/user.types";
import { SUBSCRIPTION_TYPES } from "@/modules/subscription/subscription.types";
import { TRAINER_TYPES } from "@/modules/trainer/trainer.types";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,
    @inject(AUTH_TYPES.OTPService)
    private _otpService: IOtpService,
    @inject(AUTH_TYPES.SessionService)
    private _sessionService: ISessionService,
    @inject(TRAINER_TYPES.TrainerProfileRepository)
    private _trainerProfileRepository: ITrainerProfileRepository,
    @inject(SUBSCRIPTION_TYPES.UserSubscriptionRepository)
    private _userSubscriptionRepository: IUserSubscriptionRepository,
    @inject(AUTH_TYPES.AnswerRepository)
    private _answerRepository: IAnswerRepository,
  ) {}

  async requestRegistration(data: RegisterDto): Promise<void> {
    if (data.role === ROLES.ADMIN) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.REGISTER.ADMIN_NOT_ALLOWED);
    }

    if (![ROLES.USER, ROLES.TRAINER].includes(data.role)) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.REGISTER.INVALID_ROLE);
    }

    const existing = await this._userRepository.findByEmail(
      data.email.toLowerCase().trim(),
    );
    if (existing) {
      throw new AppError(STATUS.CONFLICT, MESSAGES.REGISTER.EMAIL_EXISTS);
    }

    const otpPurpose =
      data.role === ROLES.TRAINER ? "TRAINER_REGISTER" : "USER_REGISTER";
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

  async completeRegistration(data: RegisterDto): Promise<RegisterResponseDto> {
    const hashedPassword = await hashPassword(data.password);
    const normalizedEmail = data.email.toLowerCase().trim();
    const baseUsername = normalizedEmail.split("@")[0];

    if (!baseUsername) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.REGISTER.INVALID_EMAIL_FORMAT,
      );
    }

    let userName = baseUsername;
    let counter = 1;

    while (await this._userRepository.findByUsername(userName)) {
      userName = `${baseUsername}${counter++}`;
    }

    const user = await this._userRepository.create({
      name: data.name.trim(),
      userName,
      email: normalizedEmail,
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      role: data.role,
      isVerified: true,
      isBlocked: false,
    });

    return AuthMapper.toRegisterResponse(user);
  }

  async login(
    data: LoginDto,
  ): Promise<{ response: LoginResponseDto; refreshToken: string }> {
    const user = await this._userRepository.findByEmail(
      data.email.toLowerCase().trim(),
    );
    if (!user)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.LOGIN.INVALID_CREDENTIALS,
      );

    const match = await bcrypt.compare(data.password, user.password);
    if (!match)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.LOGIN.INVALID_CREDENTIALS,
      );

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

    if (user.role === ROLES.TRAINER) {
      const trainerProfile = await this._trainerProfileRepository.findByUserId(
        user.id,
      );
      trainerStatus = !trainerProfile
        ? { profileExists: false }
        : {
            profileExists: true,
            verificationStatus: trainerProfile.verificationStatus,
            rejectionReason: trainerProfile.rejectionReason ?? null,
          };
    }

    let onboardingComplete: boolean | undefined;
    let hasActiveSubscription: boolean | undefined;

    if (user.role === ROLES.USER) {
      const [activeSub, userAnswers] = await Promise.all([
        this._userSubscriptionRepository.findActiveByUserId(user.id),
        this._answerRepository.getUserAnswers(user.id),
      ]);
      hasActiveSubscription = !!activeSub;
      onboardingComplete = userAnswers?.completed ?? false;
    }

    /* ---------- TOKENS ---------- */
    const accessToken = Jwt.signAccess({ sub: user.id, role: user.role });

    const refreshToken = await this._sessionService.createRefreshToken(
      user.id,
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    );

    let profile = null;
    if (user.role === ROLES.TRAINER) {
      profile = await this._trainerProfileRepository.findByUserId(user.id);
    }

    return {
      response: AuthMapper.toLoginResponse(
        user,
        accessToken,
        trainerStatus,
        onboardingComplete,
        hasActiveSubscription,
        profile,
      ),
      refreshToken,
    };
  }

  async googleLogin({ idToken }: GoogleLoginDto): Promise<{ response: GoogleLoginResponseDto; refreshToken: string }> {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.COMMON.GOOGLE_CLIENT_ID_MISSING,
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.email_verified) {
      throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.LOGIN.INVALID_GOOGLE_TOKEN);
    }

    const email = payload.email.toLowerCase().trim();
    const user = await this._userRepository.findByEmail(email);

    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.REGISTER.NO_ACCOUNT_FOUND);
    if (user.isBlocked)
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.LOGIN.ACCOUNT_BLOCKED);

    let onboardingComplete: boolean | undefined;
    let hasActiveSubscription: boolean | undefined;

    if (user.role === ROLES.USER) {
      const [activeSub, userAnswers] = await Promise.all([
        this._userSubscriptionRepository.findActiveByUserId(user.id),
        this._answerRepository.getUserAnswers(user.id),
      ]);
      hasActiveSubscription = !!activeSub;
      onboardingComplete = userAnswers?.completed ?? false;
    }

    const accessToken = Jwt.signAccess({ sub: user.id, role: user.role });
    const refreshToken = await this._sessionService.createRefreshToken(
      user.id,
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    );

    let profile = null;
    let trainerStatus = undefined;
    if (user.role === ROLES.TRAINER) {
      profile = await this._trainerProfileRepository.findByUserId(user.id);
      trainerStatus = !profile
        ? { profileExists: false }
        : {
            profileExists: true,
            verificationStatus: profile.verificationStatus,
            rejectionReason: profile.rejectionReason ?? null,
          };
    }

    return {
      response: AuthMapper.toLoginResponse(
        user,
        accessToken,
        trainerStatus,
        onboardingComplete,
        hasActiveSubscription,
        profile,
      ),
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<LoginResponseDto> {
    if (!refreshToken) {
      throw new AppError(
        STATUS.UNAUTHORIZED,
        MESSAGES.TOKEN.REFRESH_TOKEN_INVALID,
      );
    }

    const userId =
      await this._sessionService.findUserByRefreshToken(refreshToken);
    if (!userId)
      throw new AppError(
        STATUS.UNAUTHORIZED,
        MESSAGES.TOKEN.REFRESH_TOKEN_INVALID,
      );

    const isValid = await this._sessionService.validateRefreshToken(
      userId,
      refreshToken,
    );
    if (!isValid)
      throw new AppError(
        STATUS.UNAUTHORIZED,
        MESSAGES.TOKEN.REFRESH_TOKEN_INVALID,
      );

    const sessionData = await this._sessionService.getUserSessionData(userId);
    if (!sessionData || sessionData.isBlocked) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.LOGIN.SESSION_EXPIRED);
    }

    const user = await this._userRepository.findById(userId);
    if (!user)
      throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);

    let onboardingComplete: boolean | undefined;
    let hasActiveSubscription: boolean | undefined;

    if (user.role === ROLES.USER) {
      const [activeSub, userAnswers] = await Promise.all([
        this._userSubscriptionRepository.findActiveByUserId(user.id),
        this._answerRepository.getUserAnswers(user.id),
      ]);
      hasActiveSubscription = !!activeSub;
      onboardingComplete = userAnswers?.completed ?? false;
    }

    let profile = null;
    let trainerStatus = undefined;
    if (user.role === ROLES.TRAINER) {
      profile = await this._trainerProfileRepository.findByUserId(user.id);
      trainerStatus = !profile
        ? { profileExists: false }
        : {
            profileExists: true,
            verificationStatus: profile.verificationStatus,
            rejectionReason: profile.rejectionReason ?? null,
          };
    }

    const accessToken = Jwt.signAccess({ sub: user.id, role: user.role });
    return AuthMapper.toLoginResponse(
      user,
      accessToken,
      trainerStatus,
      onboardingComplete,
      hasActiveSubscription,
      profile,
    );
  }

  async logout(refreshToken: string): Promise<void> {
    await this._sessionService.deleteSession(refreshToken);
  }

  async requestPasswordReset(data: {
    email: string;
  }): Promise<ForgotPasswordResponseDto> {
    const email = data.email.toLowerCase().trim();
    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    }

    await this._otpService.generateAndSendOtp({
      email,
      purpose: "FORGET_PASSWORD",
    });
    return { role: user.role };
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    const normalizedEmail = data.email.toLowerCase().trim();

    const isVerified = await this._sessionService.isOtpVerified(
      "FORGET_PASSWORD",
      normalizedEmail,
    );
    if (!isVerified)
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.OTP.OTP_NOT_VERIFIED);

    const user = await this._userRepository.findByEmail(normalizedEmail);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    const match = await bcrypt.compare(data.password, user.password);
    if (match)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.PASSWORD.NEW_PASSWORD_SAME_AS_OLD,
      );

    const hashedPassword = await hashPassword(data.password);
    await this._userRepository.updatePassword(user.id, hashedPassword);
    await this._sessionService.clearOtpVerification(
      "FORGET_PASSWORD",
      normalizedEmail,
    );
  }
}
