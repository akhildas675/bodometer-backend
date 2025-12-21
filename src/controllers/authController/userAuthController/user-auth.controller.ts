import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../../../interfaces/user/IAuthService";
import { LoginUserDto, RegisterUserDto } from "../../../dto/user/user-auth.dto";
import { AppError } from "../../../utils/appError";
import { STATUS } from "../../../constants/statuscode";
import { MESSAGES } from "../../../constants/messages";
import { OtpService } from "../../../services/otp/otp.services";
import { email } from "zod";


export class UserAuthController {


  constructor(private authService: IAuthService,
    private otpService:OtpService
  ) { }

 register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as RegisterUserDto;

      await this.authService.initiateRegister(body);

      return res.status(200).json({
        success: true,
        message: "OTP sent to email",
        data: { email: body.email },
      });
    } catch (error) {
      next(error);
    }
  };

  verifyRegisterOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, otp, userData } = req.body;

      await this.otpService.verifyOtp(
        email,
        otp,
        "USER_REGISTER"
      );

      const user = await this.authService.registerUser(userData);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  };


  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    await this.authService.resendOtp(email);

    return res.status(STATUS.OK).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};



  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as LoginUserDto;

      const result = await this.authService.loginUser(body);

      // store refresh token in cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      console.log("Login successful")

      return res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.LOGIN.SUCCESS,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        }
      });



    } catch (error) {
      next(error);
    }
  };


  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new AppError(STATUS.UNAUTHORIZED, "Refresh token missing");
      }

      const result = await this.authService.refreshToken(refreshToken)

      return res.status(STATUS.OK).json({
        success: true,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });

    return res.status(STATUS.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  };



}