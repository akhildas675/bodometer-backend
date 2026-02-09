
import { FindTrainerResponseDto, UpdateTrainerProfileDto } from "../../dto/trainer/trainer.dto";
import { TrainerWorkoutList } from "./trainer.interface";

export interface ITrainerService{
    fetchTrainer(trainerId:string):Promise<FindTrainerResponseDto>;
    fetchWorkoutList():Promise<TrainerWorkoutList[]>
    updateTrainerProfile(trainerId:string,updateData:UpdateTrainerProfileDto):Promise<FindTrainerResponseDto>;
    uploadTrainerProfilePicture(userId: string, file: Express.Multer.File): Promise<string>;
}