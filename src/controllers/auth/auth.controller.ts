import { NextFunction, Request, Response } from "express";
import { Logger } from "../../utils/logger";
import { IAuthService } from "../../interfaces/service-interface/auth/auth-service.interface";
import { OtpVerifyDto, RegisterDto } from "../../dto/auth/auth.dto";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import { ResendOtpDto } from "../../dto/otp/otp.dto";
import { redis } from "../../config/redis";
import { AppError } from "../../utils/appError";
import { SuccessResponse } from "../../utils/success.response";

const logger = new Logger("AuthController");

export class AuthController {
  constructor(private _authService: IAuthService) {}

  //send OTP
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as RegisterDto;

      logger.debug("Register request received", {
        email: body.email,
        role: body.role,
      });

      await this._authService.initiateRegister(body);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.OTP.SENT_SUCCESS,
        { email: body.email }
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  // verify OTP
  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as OtpVerifyDto;

      console.debug(
        "controller verify otp email:",
        data.email,
        "purpose:",
        data.purpose,
      );

      await this._authService.verifyOtp(data);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.OTP.VERIFIED_SUCCESS
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as ResendOtpDto;

      console.debug(
        "controller resend otp email:",
        data.email,
        "purpose:",
        data.purpose,
      );

      await this._authService.resendOtp(data);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.OTP.RESENT_SUCCESS
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  // final register
  completeRegister = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const body = req.body as RegisterDto;

      console.debug(
        "controller complete register email:",
        body.email,
        "role:",
        body.role,
      );

      const purpose =
        body.role === "trainer" ? "TRAINER_REGISTER" : "USER_REGISTER";

      const redisKey = `otp_verified:${purpose}:${body.email}`;

      console.debug("controller complete register redis key:", redisKey);

      const verified = await redis.get(redisKey);

      console.debug(
        "controller complete register otp verified:",
        Boolean(verified),
      );

      if (!verified) {
        throw new AppError(STATUS.FORBIDDEN, MESSAGES.OTP.OTP_NOT_VERIFIED);
      }

      const user = await this._authService.register(body);

      await redis.del(redisKey);

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.REGISTER.SUCCESS,
        user
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  //Login
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { response: loginResponse, refreshToken } =
        await this._authService.login(req.body);

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
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const result = await this._authService.forgotPassword({ email });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.PASSWORD.RESET_EMAIL_SENT,
        { role: result.role }
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

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
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

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
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, purpose } = req.body;

      if (purpose !== "FORGET_PASSWORD") {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.PASSWORD.INVALID_RESET_PURPOSE,
        );
      }

      await this._authService.resetPassword(req.body);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.PASSWORD.RESET_SUCCESS
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.LOGIN.GOOGLE_TOKEN_REQUIRED,
        );
      }

      const result = await this._authService.googleLogin({ idToken });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.LOGIN.GOOGLE_LOGIN_SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };
}
