import { NextFunction, Request, Response } from "express";
import { IAuthService } from "../../interfaces/auth/auth-service.interface";
import { OtpVerifyDto, RegisterDto } from "../../dto/auth/auth.dto";
import { ResendOtpDto } from "../../dto/otp/otp.dto";
import { redis } from "../../config/redis";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { Logger } from "../../utils/logger";
import { MESSAGES } from "../../constants/messages";

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

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.OTP.SENT_SUCCESS,
        data: {
          email: body.email,
        },
      });
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

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.OTP.VERIFIED_SUCCESS,
      });
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

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.OTP.RESENT_SUCCESS,
      });
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

      res.status(STATUS.CREATED).json({
        success: true,
        message: MESSAGES.REGISTER.SUCCESS,
        data: user,
      });
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
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.status(STATUS.OK).json({

        success: true,
        message: MESSAGES.LOGIN.SUCCESS,
        data: loginResponse,
      });
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      console.log("E mail for the forget password controller", email);

      const result = await this._authService.forgotPassword({ email });

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.PASSWORD.RESET_EMAIL_SENT,
        data: {
          role: result.role,
        },
      });
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

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.TOKEN.REFRESH_SUCCESS,
        data: result,
      });
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

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.LOGIN.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, purpose } = req.body;

      console.log("email from forget password",email,purpose)

      if (purpose !== "FORGET_PASSWORD") {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.PASSWORD.INVALID_RESET_PURPOSE,
        );
      }

      await this._authService.resetPassword(req.body);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.PASSWORD.RESET_SUCCESS,
      });
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

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.LOGIN.GOOGLE_LOGIN_SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
