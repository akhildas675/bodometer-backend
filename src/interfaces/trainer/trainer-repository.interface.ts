import { TrainerWorkoutList } from "./trainer.interface";

export interface ITrainerRepository{
    getWorkoutList():Promise<TrainerWorkoutList[]>
}