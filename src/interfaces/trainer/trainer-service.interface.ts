
import { TrainerWorkoutList } from "./trainer.interface";

export interface ITrainerService{
    fetchWorkoutList():Promise<TrainerWorkoutList[]>
}