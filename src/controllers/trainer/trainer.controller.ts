import { NextFunction, Request, Response } from "express";
import { ITrainerService } from "../../interfaces/trainer/trainer-service.interface";


export class TrainerController {
  constructor(private _trainerService: ITrainerService) { }

  getWorkoutList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workoutList = await this._trainerService.fetchWorkoutList();
      res.status(200).json({
        success: true,
        data: workoutList,
      });
    } catch (error) {
      next(error);
    }
  };
}
