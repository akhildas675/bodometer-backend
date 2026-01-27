import { NextFunction, Request, Response } from "express";
import { TrainerServiceInterface } from "../../interfaces/trainer/trainer-service.interface";

export class TrainerController {
    constructor(private trainerService:TrainerServiceInterface) { }

    getWorkoutList = async (req:Request, res: Response, next: NextFunction) => {
        try {
            const workoutList = await this.trainerService.fetchWorkoutList();
            res.status(200).json({
                success:true,
                data:workoutList
            })

        } catch (error) {
            next(error)
        }
    }
}