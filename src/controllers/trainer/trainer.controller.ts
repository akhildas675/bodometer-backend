import { NextFunction, Request, Response } from "express";
import { ITrainerService } from "../../interfaces/trainer/trainer-service.interface";
import { STATUS } from "../../constants/statuscode";
import { AuthRequest } from "../../middleware/authGuard";


export class TrainerController {
  constructor(private _trainerService: ITrainerService) { }

  getWorkoutList = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workoutList = await this._trainerService.fetchWorkoutList();
      res.status(STATUS.OK).json({
        success: true,
        data: workoutList,
      });
    } catch (error) {
      next(error);
    }
  };
}
