import { TrainerWorkoutList } from "./trainer.interface";

export interface TrainerRepositoryInterface{
    getWorkoutList():Promise<TrainerWorkoutList[]>
}