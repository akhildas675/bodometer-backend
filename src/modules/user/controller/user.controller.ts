import { NextFunction, Response, Request } from "express";
import { AuthRequest } from "../../../middleware/authGuard";
import { Logger } from "../../../utils/logger";
import { AppError } from "../../../utils/appError";
import { STATUS } from "../../../constants/constant.values.ts/statuscode";
import { MESSAGES } from "../../../constants/messages";
import {
  ChangePasswordDto,
  UpdateUserProfileDto,
  UpdateBmiDto,
} from "../dto/user.dto";
import { IUserService } from '@/modules/user/interface/user-service.interface';
import { SuccessResponse } from "../../../utils/success.response";
import { GetUsersDto } from "../dto/user.dto";
import { parsePaginationQuery } from "../../../utils/query";
import { inject, injectable } from "inversify";
import { USER_TYPES } from "../user.types";

@injectable()
export class UserController {
  private logger = new Logger("UserController");
  constructor(
    @inject(USER_TYPES.UserService) private _userService: IUserService
  ) { }

  getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const userId = req.user.id;
      const user = await this._userService.getUser(userId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.PROFILE_FETCHED,
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
      const updateData = req.body as UpdateUserProfileDto;

      const updatedUser = await this._userService.updateProfile(
        userId,
        updateData,
      );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.PROFILE_UPDATED,
        updatedUser
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.VALIDATION.REQUIRED_FIELD,
        );
      }

      const userId = req.user.id;
      const file = req.file;

      const profilePicUrl = await this._userService.uploadProfilePicture(
        userId,
        file,
      );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.PROFILE_PICTURE_UPDATED,
        { url: profilePicUrl }
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  changePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user)
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const body = req.body as { currentPassword?: string; newPassword?: string };
      const dto: ChangePasswordDto = {
        currentPassword: body.currentPassword || "",
        newPassword: body.newPassword || "",
      };
      await this._userService.changePassword(req.user.id, dto);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.PASSWORD.CHANGED_SUCCESS
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  toggleStatusUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this._userService.toggleStatusUser(id);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, result).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  }

  getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: GetUsersDto = {
        ...parsePaginationQuery(req)
      };

      const result = await this._userService.fetchUsers(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result.data,
        result.pagination
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };





  calculateBmiPublic = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = req.body as UpdateBmiDto;
      const result = await this._userService.calculateBmi(data);
  
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.BMI_CALCULATED,
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




}
