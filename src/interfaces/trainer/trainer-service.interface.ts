
import { TrainerWorkoutList } from "./trainer.interface";

export interface TrainerServiceInterface{
    fetchWorkoutList():Promise<TrainerWorkoutList[]>
}