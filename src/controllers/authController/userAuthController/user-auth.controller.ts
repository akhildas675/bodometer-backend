import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../../../interfaces/user/IAuthServices";
import { LoginUserDto, RegisterUserDto } from "../../../dto/user/user-auth.dto";
import { AppError } from "../../../utils/appError";
import { STATUS } from "../../../constants/statuscode";
import { MESSAGES } from "../../../constants/messages";


export class UserAuthController {

  constructor(private authService: IAuthService) { }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as unknown as RegisterUserDto;
      console.log("User Register data........", body)
      const user = await this.authService.registerUser(body);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });

    } catch (error) {
      next(error)
    }
  }

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