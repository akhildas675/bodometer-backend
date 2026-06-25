import { NextFunction, Response } from "express";
import { AuthRequest } from "../../../middleware/authGuard";
import { AppError } from "../../../utils/appError";
import { STATUS } from "../../../constants/statuscode";
import { MESSAGES } from "../../../constants/messages";
import { SuccessResponse } from "../../../utils/success.response";
import { WORKOUT_EXERCISE_STATUS, WorkoutExerciseStatus, Timeframe } from "../../../constants/fitness.constant";
import { inject, injectable } from "inversify";
import { WORKOUT_PLAN_TYPES } from "../workout-plan.types";
import { IWorkoutPlanService } from "../interface/workout-plan-service.interface";

@injectable()
export class WorkoutPlanController {
  constructor(
    @inject(WORKOUT_PLAN_TYPES.WorkoutPlanService) private _workoutPlanService: IWorkoutPlanService
  ) {}

  generateWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const result = await this._workoutPlanService.generateWorkout(req.user.id);

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
      const plans = await this._workoutPlanService.getWorkoutPlans(req.user.id);

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

      const updatedPlan = await this._workoutPlanService.markDayCompleted({ userId: req.user.id, planId, dayNumber: Number(dayNumber), completed });

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

      const updatedPlan = await this._workoutPlanService.markExerciseStatus({ userId: req.user.id, planId, dayNumber: Number(dayNumber), instanceId: exerciseId, status });

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
      const progress = await this._workoutPlanService.getWorkoutProgress(userId, timeframe);

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
}
