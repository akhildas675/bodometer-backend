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
import { SubscriptionTransactionQueryDto } from "../../dto/subscription/subscription.dto";
import { IUserService } from "../../interfaces/service-interface/user/user-service.interface";
import { IHealthLogService } from "../../interfaces/service-interface/health-log/health-log-service.interface";
import { UpsertHealthLogDto } from "../../dto/health-log/health-log.dto";
import { SuccessResponse } from "../../utils/success.response";
import { DifficultyLevel, WORKOUT_EXERCISE_STATUS, WorkoutExerciseStatus, Timeframe } from "../../constants/fitness.constant";
import { GetSlotsQueryDto, CreateBookingDto, GetBookingsQueryDto } from "../../dto/trainer/trainer-booking.dto";
export class UserController {
  private logger = new Logger("UserController");
  constructor(
    private _userService: IUserService,
    private _healthLogService: IHealthLogService
  ) { }

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

  getMealCategories = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = parsePaginationQuery(req);

      const result = await this._userService.getMealCategories(query);
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

  getHealthLog = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const date = (req.query.date as string) || new Date().toISOString();
      const result = await this._healthLogService.getHealthLog(req.user.id, date);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, result).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  upsertHealthLog = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const data = req.body as unknown as UpsertHealthLogDto;
      if (!data.date) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.DATE_REQUIRED);
      const result = await this._healthLogService.upsertHealthLog(req.user.id, data);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, result).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getHealthLogProgress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const timeframe = req.query.timeframe as Timeframe | undefined;
      const result = await this._healthLogService.getHealthLogProgress(req.user.id, timeframe);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, result).send(res);
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
      const query: SubscriptionTransactionQueryDto = {
        page: parsed.page,
        limit: parsed.limit,
        search: parsed.search,
        sortBy: parsed.sortBy,
        sortOrder: parsed.sortOrder,
        status,
      };
      const result = await this._userService.getUserTransactions(
        req.user.id,
        query,
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

  generateWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const result = await this._userService.generateWorkout(req.user.id);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.WORKOUT_PLAN.GENERATED,
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

  getWorkoutPlans = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const plans = await this._userService.getWorkoutPlans(req.user.id);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.WORKOUT_PLAN.PLAN_LIST_FETCHED,
        plans
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  markDayCompleted = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const { planId, dayNumber } = req.params;
      const { completed } = req.body as { completed: boolean };

      if (typeof completed !== "boolean") {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.COMPLETED_FIELD_REQUIRED);
      }

      const updatedPlan = await this._userService.markDayCompleted({ userId: req.user.id, planId, dayNumber: Number(dayNumber), completed });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.WORKOUT_PLAN.DAY_MARKED,
        updatedPlan
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  markExerciseStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const { planId, dayNumber, exerciseId } = req.params;
      const { status } = req.body as { status: WorkoutExerciseStatus };

      if (
        status !== WORKOUT_EXERCISE_STATUS.PENDING &&
        status !== WORKOUT_EXERCISE_STATUS.ACTIVE &&
        status !== WORKOUT_EXERCISE_STATUS.COMPLETED &&
        status !== WORKOUT_EXERCISE_STATUS.SKIPPED
      ) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.STATUS_FIELD_REQUIRED);
      }

      const updatedPlan = await this._userService.markExerciseStatus({ userId: req.user.id, planId, dayNumber: Number(dayNumber), instanceId: exerciseId, status });

      new SuccessResponse(
        STATUS.OK,
        "Exercise status updated successfully",
        updatedPlan
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getWorkoutProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const timeframe = req.query.timeframe as Timeframe | undefined;
      const progress = await this._userService.getWorkoutProgress(userId, timeframe);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.WORKOUT_PLAN.PROGRESS_FETCHED,
        progress
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getAvailableSlots = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
      const query = req.query as unknown as GetSlotsQueryDto;
      const slots = await this._userService.getAvailableSlots(req.params.id, query);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, slots).send(res);
    } catch (error) { next(error); }
  };

  createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
      const data = req.body as CreateBookingDto;
      const booking = await this._userService.createBooking(req.user.id, data);
      new SuccessResponse(STATUS.CREATED, MESSAGES.TRAINER.BOOKING_CREATED, booking).send(res);
    } catch (error) { next(error); }
  };

  getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
      const query = req.query as unknown as GetBookingsQueryDto;
      const result = await this._userService.getUserBookings(req.user.id, query);
      new SuccessResponse(STATUS.OK, MESSAGES.TRAINER.BOOKING_FETCHED, result.data, result.pagination).send(res);
    } catch (error) { next(error); }
  };

  cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
      const data = req.body as { reason?: string };
      const reason = data.reason as string;
      const booking = await this._userService.cancelBookingByUser(req.user.id, req.params.bookingId, reason);
      new SuccessResponse(STATUS.OK, MESSAGES.TRAINER.SESSION_CANCELLED, booking).send(res);
    } catch (error) { next(error); }
  };
}
