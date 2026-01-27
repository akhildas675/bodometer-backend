import { NextFunction, Request, Response } from "express";
import { IUserService } from "../../interfaces/user/user-service.interface";
import { UpdateUserProfileDto } from "../../dto/user/user.dto";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { AuthRequest } from "../../middleware/authGuard";

export class UserController {
  constructor(private _userService: IUserService) {}

  getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, "User not authenticated");
      }

      const userId = req.user.id;
      const user = await this._userService.fetchUser(userId);

      res.status(200).json({
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
        throw new AppError(STATUS.UNAUTHORIZED, "User not authenticated");
      }

      const userId = req.user.id;
      const updateData: UpdateUserProfileDto = req.body;

      const updatedUser = await this._userService.updateUserProfile(
        userId,
        updateData,
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
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
        throw new AppError(STATUS.UNAUTHORIZED, "User not authenticated");
      }

      if (!req.file) {
        throw new AppError(STATUS.BAD_REQUEST, "No file uploaded");
      }

      const userId = req.user.id;
      const file = req.file;

      const profilePicUrl = await this._userService.uploadProfilePicture(
        userId,
        file,
      );

      res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          url: profilePicUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
