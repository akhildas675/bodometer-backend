import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../../middleware/authGuard";
import { Logger } from "../../utils/logger";
import { parsePaginationQuery } from "../../utils/query";
import { AppError } from "../../utils/appError";
import { ExerciseQueryDto } from "../../dto/exercise/exercise.dto";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import {
  ChangePasswordDto,
  UpdateBmiDto,
  UpdateUserProfileDto,
} from "../../dto/user/user.dto";
import { GetTrainersQueryDto } from "../../dto/trainer/trainer.dto";
import { IUserService } from "../../interfaces/service-interface/user/user-service.interface";
import { SuccessResponse } from "../../utils/success.response";
import { DifficultyLevel } from "../../constants/fitness.constant";

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
      console.log("old password...",body)
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

  getTrainers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: GetTrainersQueryDto = {
        ...parsePaginationQuery(req),
        ...(typeof req.query.specializationId === "string" && { specializationId: req.query.specializationId }),
      };

      const result = await this._userService.getTrainers(query);
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getAllEquipment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = parsePaginationQuery(req);

      const result = await this._userService.getAllEquipment(query);
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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

      const body = req.body as { planId?: string };
      const planId = body.planId;
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
      await this._userService.submitOnboarding(
        req.user.id,
        req.body as Parameters<IUserService["submitOnboarding"]>[1],
      );
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.ONBOARDING_SAVED
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
      const status = typeof req.query.status === "string" ? req.query.status : undefined;
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

getExercises = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, difficulty, targetMuscleId, categoryId, page, limit } = req.query;

    const query: ExerciseQueryDto = {
      search: search as string | undefined,
      difficulty: difficulty as DifficultyLevel | undefined,
      targetMuscleId: targetMuscleId as string | undefined,
      categoryId: categoryId as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await this._userService.getExercises(query);

    new SuccessResponse(
      STATUS.OK,
      MESSAGES.EXERCISE.LIST_FETCHED,
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

  getExerciseById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { exerciseId } = req.params;

      if (!exerciseId) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
      }

      const exercise = await this._userService.getExerciseById(exerciseId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.EXERCISE.FETCHED,
        exercise
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
