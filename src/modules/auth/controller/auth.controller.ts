import { NextFunction, Request, Response } from "express";
import { Logger } from "../../../utils/logger";
import { IAuthService } from "../interface/auth-service.interface";
import { ForgotPasswordDto, GoogleLoginDto, LoginDto, OtpVerifyDto, RegisterDto, ResetPasswordDto } from "../dto/auth.dto";
import { STATUS } from "../../../constants/statuscode";
import { MESSAGES } from "../../../constants/messages";
import { ResendOtpDto } from "../../../dto/otp/otp.dto";
import { redis } from "../../../config/redis";
import { AppError } from "../../../utils/appError";
import { SuccessResponse } from "../../../utils/success.response";
import { inject, injectable } from "inversify";
import { AUTH_TYPES } from "../auth.types";

const logger = new Logger("AuthController");
@injectable()
export class AuthController {
  constructor(
    @inject(AUTH_TYPES.AuthService)
    private _authService: IAuthService
  ) {}

  //send OTP
  requestRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as RegisterDto;

      logger.debug("Register request received", {
        email: body.email,
        role: body.role,
      });

      await this._authService.requestRegistration(body);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.OTP.SENT_SUCCESS,
        { email: body.email }
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  // verify OTP
  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as OtpVerifyDto;

      logger.debug("controller verify otp email", {
        email: data.email,
        purpose: data.purpose,
      });

      await this._authService.verifyOtp(data);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.OTP.VERIFIED_SUCCESS
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as ResendOtpDto;

      logger.debug("controller resend otp email", {
        email: data.email,
        purpose: data.purpose,
      });

      await this._authService.resendOtp(data);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.OTP.RESENT_SUCCESS
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  // final register
  completeRegistration = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const body = req.body as RegisterDto;

      logger.debug("controller complete register email", {
        email: body.email,
        role: body.role,
      });

      const purpose =
        body.role === "trainer" ? "TRAINER_REGISTER" : "USER_REGISTER";

      const redisKey = `otp_verified:${purpose}:${body.email}`;

      logger.debug("controller complete register redis key", { redisKey });

      const verified = await redis.get(redisKey);

      logger.debug("controller complete register otp verified", {
        verified: Boolean(verified),
      });

      if (!verified) {
        throw new AppError(STATUS.FORBIDDEN, MESSAGES.OTP.OTP_NOT_VERIFIED);
      }

      const user = await this._authService.completeRegistration(body);

      await redis.del(redisKey);

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.REGISTER.SUCCESS,
        user
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  //Login
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as LoginDto;
      const { response: loginResponse, refreshToken } =
        await this._authService.login(body);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return new SuccessResponse(
        STATUS.OK,
        MESSAGES.LOGIN.SUCCESS,
        loginResponse
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as ForgotPasswordDto;

      const result = await this._authService.requestPasswordReset({ email });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.PASSWORD.RESET_EMAIL_SENT,
        { role: result.role }
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookies = req.cookies as Record<string, string | undefined> | undefined;
      const refreshToken = cookies?.refreshToken;

      if (!refreshToken) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.TOKEN.REFRESH_TOKEN_MISSING,
        );
      }

      const result = await this._authService.refreshAccessToken(refreshToken);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.TOKEN.REFRESH_SUCCESS,
        result
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookies = req.cookies as Record<string, string | undefined> | undefined;
      const refreshToken = cookies?.refreshToken;

      if (refreshToken) {
        await this._authService.logout(refreshToken);
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.LOGIN.LOGOUT_SUCCESS
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as ResetPasswordDto;
      const { purpose } = body;

      if (purpose !== "FORGET_PASSWORD") {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.PASSWORD.INVALID_RESET_PURPOSE,
        );
      }

      await this._authService.resetPassword(body);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.PASSWORD.RESET_SUCCESS
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body as GoogleLoginDto;

      if (!idToken) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.LOGIN.GOOGLE_TOKEN_REQUIRED,
        );
      }

      const { response: loginResponse, refreshToken } =
        await this._authService.googleLogin({ idToken });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.LOGIN.GOOGLE_LOGIN_SUCCESS,
        loginResponse
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };
}
