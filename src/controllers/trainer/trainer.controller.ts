import { NextFunction, Request, Response } from "express";
<<<<<<< HEAD

>>>>>>> fix/architecture-format-backend

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
