import { UpdateTrainerProfileDto } from "../../dto/trainer/trainer.dto";
import { TrainerProfileInterface, TrainerWorkoutList } from "./trainer.interface";

export interface ITrainerRepository{
    findById(trainerId: string): Promise<TrainerProfileInterface | null>;
    getWorkoutList():Promise<TrainerWorkoutList[]>
    updateTrainerProfile(trainerId:string,updateData:UpdateTrainerProfileDto):Promise<TrainerProfileInterface| null>;

}