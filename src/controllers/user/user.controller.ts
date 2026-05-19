import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/authGuard";
import { Logger } from "../../utils/logger";
import { parsePaginationQuery } from "../../utils/query";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import {
  ChangePasswordDto,
  UpdateBmiDto,
  UpdateUserProfileDto,
} from "../../dto/user/user.dto";
import { GetTrainersQueryDto } from "../../dto/trainer/trainer.dto";
import { IUserService } from "@/interfaces/service-interface/user/user-service.interface";
import { SuccessResponse } from "../../utils/success.response";

export class UserController {
  private logger = new Logger("UserController");
  constructor(private _userService: IUserService) { }

  getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const userId = req.user.id;
      const user = await this._userService.fetchUser(userId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.PROFILE_FETCHED,
        user
      ).send(res);
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

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.PROFILE_UPDATED,
        updatedUser
      ).send(res);
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

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.PROFILE_PICTURE_UPDATED,
        { url: profilePicUrl }
      ).send(res);
    } catch (error) {
      next(error);
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
      const dto: ChangePasswordDto = {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      };
      await this._userService.changePassword(req.user.id, dto);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.PASSWORD.CHANGED_SUCCESS
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getTrainers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: GetTrainersQueryDto = {
        ...parsePaginationQuery(req),
        ...(req.query.specializationId && { specializationId: String(req.query.specializationId) }),
      };

      const result = await this._userService.getTrainers(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result.data,
        result.pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };
  getTrainerById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
      }

      const result = await this._userService.getTrainerById(id);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = parsePaginationQuery(req);

      const result = await this._userService.getCategories(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result.data,
        result.pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { categoryId } = req.params;

      if (!categoryId) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
      }

      const result = await this._userService.getCategoryById(categoryId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getMySubscriptions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.USER_NOT_FOUND);
      }

      const result = await this._userService.getMySubscriptions();

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result
      ).send(res);
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
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const { planId } = req.body;
      if (!planId) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
      }

      const result = await this._userService.createCheckoutSession(
        req.user.id,
        planId,
      );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  verifyPayment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { session_id } = req.query;
      if (!session_id || typeof session_id !== "string") {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.SESSION_ID_REQUIRED);
      }

      const result = await this._userService.verifyPaymentAndSave(
        req.user!.id,
        session_id,
      );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.PAYMENT_VERIFIED,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getActiveSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const result = await this._userService.getActiveSubscription(req.user.id);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getOnboardingGroups = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this._userService.getOnboardingGroups();
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result.data,
        result.pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getOnboardingQuestions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this._userService.getOnboardingQuestions();
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result.data,
        result.pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  submitOnboarding = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      await this._userService.submitOnboarding(req.user.id, req.body);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.ONBOARDING_SAVED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getOnboardingStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const result = await this._userService.getOnboardingStatus(req.user.id);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getOnboardingAnswers = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const result = await this._userService.getOnboardingAnswers(req.user.id);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getUserTransactions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const parsed = parsePaginationQuery(req);
      const status = req.query.status ? String(req.query.status) : undefined;
      const result = await this._userService.getUserTransactions(
        req.user.id,
        parsed.search,
        parsed.sortBy,
        parsed.sortOrder,
        parsed.page,
        parsed.limit,
        status,
      );
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result.data,
        result.pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  calculateBmiPublic = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data: UpdateBmiDto = req.body;
      const result = await this._userService.calculateBmi(data)

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.BMI_CALCULATED,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };
}
