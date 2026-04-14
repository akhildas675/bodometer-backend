import { NextFunction, Request, Response } from "express";
import { IUserService } from "@/interfaces/user/user-service.interface";
import {
  ChangePasswordDto,
  CreateCheckoutSessionDto,
  GetTrainersQueryDto,
  GetUserWorkoutsQueryDto,
  UpdateUserProfileDto,
} from "@/dto/user/user.dto";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/statuscode";
import { AuthRequest } from "@/middleware/authGuard";
import { MESSAGES } from "@/constants/messages";
import { success } from "zod";

export class UserController {
  constructor(private _userService: IUserService) { }

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


  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const dto: ChangePasswordDto = {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      };
      await this._userService.changePassword(req.user.id, dto);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.PASSWORD.CHANGED_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };

  getWorkouts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: GetUserWorkoutsQueryDto = {};
      if (req.query.page) query.page = Number(req.query.page);
      if (req.query.limit) query.limit = Number(req.query.limit);
      if (req.query.search) query.search = String(req.query.search);
      if (req.query.sortBy) query.sortBy = String(req.query.sortBy);
      if (req.query.sortOrder)
        query.sortOrder = req.query.sortOrder as "asc" | "desc";

      const result = await this._userService.getWorkouts(query);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getWorkoutDetail = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      if (!id)
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
      const result = await this._userService.getWorkoutDetail(id);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  //subscriptions

  getSubscriptions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this._userService.getActiveSubscriptions();
      res
        .status(STATUS.OK)
        .json({
          success: true,
          message: MESSAGES.COMMON.SUCCESS,
          data: result,
        });
    } catch (error) {
      next(error);
    }
  };

  getMySubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user)
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const result = await this._userService.getUserActiveSubscription(
        req.user.id,
      );
      res
        .status(STATUS.OK)
        .json({
          success: true,
          message: MESSAGES.COMMON.SUCCESS,
          data: result,
        });
    } catch (error) {
      next(error);
    }
  };

  createCheckoutSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user)
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const dto: CreateCheckoutSessionDto = { planId: req.body.planId };
      const result = await this._userService.createCheckoutSession(
        req.user.id,
        dto,
      );
      res.status(STATUS.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers["stripe-signature"] as string;
      await this._userService.handleStripeWebhook(req.body, signature);
      res.status(STATUS.OK).json({ received: true });
    } catch (error) {
      next(error);
    }
  };

  getTrainers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: GetTrainersQueryDto = {};
      if (req.query.page) query.page = Number(req.query.page);
      if (req.query.limit) query.limit = Number(req.query.limit);
      if (req.query.search) query.search = String(req.query.search);
      if (req.query.sortBy) query.sortBy = String(req.query.sortBy);
      if (req.query.sortOrder) query.sortOrder = req.query.sortOrder as "asc" | "desc";
      if (req.query.specializationId) query.specializationId = String(req.query.specializationId);

      const result = await this._userService.getTrainers(query);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };
  getTrainerById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      const { id } = req.params;

      if (!id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
      };

      const result = await this._userService.getTrainerById(id);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result,
      })

    } catch (error) {
      next(error)
    }
  }

  getWorkoutTimes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);

      const data = await this._userService.getWorkoutTimes();

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
  getWorkoutGoals = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);

      const data = await this._userService.getWorkoutGoals();

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getOnboardingOptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this._userService.getOnboardingOptions();

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  submitPremiumOnboarding = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      
      const userId = req.user.id;
      const data = req.body;
      
      await this._userService.submitPremiumOnboarding(userId, data);

      res.status(STATUS.OK).json({
        success: true,
        message: "Onboarding completed successfully!",
      });
    } catch (error) {
      next(error);
    }
  };

  fetchWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const data = await this._userService.fetchWorkouts();

      res.status(STATUS.OK).json({
        success:true,
        message:MESSAGES.COMMON.SUCCESS,
        data,
      })

    } catch (error) {
      next(error)
    }
  }


}
