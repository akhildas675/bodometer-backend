import { NextFunction, Request, Response } from "express";
import { AddWorkoutDto, CreateSubscriptionDTO, UpdateSubscriptionDTO } from "@/dto/admin/admin.dto";
import { AppError } from "@/utils/appError";
import { WorkoutMapper } from "@/mappers/admin/admin.mappers";
import { IAdminService } from "@/interfaces/admin/admin-service.interface";
import { STATUS } from "@/constants/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AuthRequest } from "@/middleware/authGuard";

export class AdminController {
  constructor(private _adminService: IAdminService) { }

  //workouts

  addWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workoutName, workoutDescription } = req.body;
      const file = req.file;

      if (!workoutName || !workoutDescription) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.VALIDATION.REQUIRED_FIELD,
        );
      }

      if (!file) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.VALIDATION.REQUIRED_FIELD,
        );
      }

      const body: AddWorkoutDto = { workoutName, workoutDescription, file };

      const result = await this._adminService.workoutAdd(body);

      res.status(STATUS.CREATED).json({
        success: true,
        message: MESSAGES.ADMIN.EXERCISE_CREATED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workouts = await this._adminService.fetchWorkouts();

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: WorkoutMapper.toResponseList(workouts),
      });
    } catch (error) {
      next(error);
    }
  };

  // subscription
  createSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: CreateSubscriptionDTO = req.body.data;
      const result = await this._adminService.createSubscription(data);
      return res.status(STATUS.CREATED).json({
        success: true,
        message: MESSAGES.SUBSCRIPTION.CREATED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllSubscriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this._adminService.getAllSubscriptions();
      return res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.SUBSCRIPTION.LIST_FETCHED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSubscriptionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.SUBSCRIPTION.ID_REQUIRED);
      }
      const result = await this._adminService.getSubscriptionById(id);
      return res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.SUBSCRIPTION.FETCHED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.SUBSCRIPTION.ID_REQUIRED);
      }
      const data: UpdateSubscriptionDTO = req.body.data;
      const result = await this._adminService.updateSubscription(id, data);
      return res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.SUBSCRIPTION.UPDATED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
toggleSubscriptionStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.SUBSCRIPTION.ID_REQUIRED);
    }
    const result = await this._adminService.toggleSubscriptionStatus(id);
    return res.status(STATUS.OK).json({
      success: true,
      message: result.isActive ? MESSAGES.SUBSCRIPTION.ACTIVATED : MESSAGES.SUBSCRIPTION.DEACTIVATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
}
