import { NextFunction, Request, Response } from "express";
import { AddWorkoutDto } from "../../dto/admin/admin.dto";
import { AppError } from "../../utils/appError";
import { WorkoutMapper } from "../../mappers/admin/admin.mappers";
import { IAdminService } from "../../interfaces/admin/admin-service.interface";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";

export class AdminController {
  constructor(private _adminService: IAdminService) { }

  //workouts

  addWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workoutName, workoutDescription } = req.body;
      const file = req.file;
      console.log("body data", req.file);

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
      // console.log(workouts);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: WorkoutMapper.toResponseList(workouts),
      });
    } catch (error) {
      next(error);
    }
  };
}
