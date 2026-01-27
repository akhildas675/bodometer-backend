import { NextFunction, Request, Response } from "express";
import { IAuthService } from "../../interfaces/auth/auth-service.interface";
import { OtpVerifyDto, RegisterDto } from "../../dto/auth/auth.dto";
import { ResendOtpDto } from "../../dto/otp/otp.dto";
import { redis } from "../../config/redis";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";

export class AuthController {
  constructor(private _authService: IAuthService) { }

  //send OTP
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as RegisterDto;

      console.debug(
        "controller register email:",
        body.email,
        "role:",
        body.role,
      );

      await this._authService.initiateRegister(body);

      res.status(200).json({
        success: true,
        message: "OTP sent to your email",
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

      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
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

      res.status(200).json({
        success: true,
        message: "OTP resent successfully",
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
        throw new AppError(STATUS.FORBIDDEN, "OTP not verified");
      }

      const user = await this._authService.register(body);

      await redis.del(redisKey);

      res.status(201).json({
        success: true,
        message: "Registration completed",
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

      return res.status(200).json({
        success: true,
        message: "Login successful",
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

      res.status(200).json({
        success: true,
        message:
          "If an account exists, a verification code has been sent to your email",
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
        throw new AppError(STATUS.UNAUTHORIZED, "No refresh token provided");
      }

      const result = await this._authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
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

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, purpose } = req.body;

      if (purpose !== "FORGET_PASSWORD") {
        throw new AppError(400, "Invalid reset purpose");
      }

      await this._authService.resetPassword(email);

      res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        throw new AppError(STATUS.BAD_REQUEST, "Google token is required");
      }

      const result = await this._authService.googleLogin({ idToken });

      res.status(STATUS.OK).json({
        success: true,
        message: "Google login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
