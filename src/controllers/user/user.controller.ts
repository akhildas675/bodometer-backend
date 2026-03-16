import { NextFunction, Request, Response } from "express";
import { IUserService } from "@/interfaces/user/user-service.interface";
import { UpdateUserProfileDto } from "@/dto/user/user.dto";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/statuscode";
import { AuthRequest } from "@/middleware/authGuard";
import { MESSAGES } from "@/constants/messages";

export class UserController {
  constructor(private _userService: IUserService) {}

  getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const userId = req.user.id;
      const user = await this._userService.fetchUser(userId);

      res.status(STATUS.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const userId = req.user.id;
      const updateData: UpdateUserProfileDto = req.body;

      const updatedUser = await this._userService.updateProfile(
        userId,
        updateData,
      );

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.USER.PROFILE_UPDATED,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  uploadProfilePicture = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      if (!req.file) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
      }

      const userId = req.user.id;
      const file = req.file;

      const profilePicUrl = await this._userService.uploadProfilePicture(
        userId,
        file,
      );

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.USER.PROFILE_PICTURE_UPDATED,
        data: {
          url: profilePicUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
