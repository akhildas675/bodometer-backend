
import {
  FindTrainerResponseDto,
  TrainerProfileDto,
  TrainerStatusResponseDto,
  UpdateTrainerProfileDto,
} from "@/dto/trainer/trainer.dto";
import { TrainerWorkoutList } from "@/interfaces/trainer/trainer.interface";

export interface ITrainerService {
  fetchTrainer(trainerId: string): Promise<FindTrainerResponseDto>;
  updateTrainerProfile(trainerId: string, updateData: UpdateTrainerProfileDto): Promise<FindTrainerResponseDto>;
  uploadTrainerProfilePicture(trainerId: string, file: Express.Multer.File): Promise<string>;
  createProfile(userId: string, data: TrainerProfileDto): Promise<void>;
  getTrainerStatus(userId: string): Promise<TrainerStatusResponseDto>;
  fetchWorkoutList(): Promise<TrainerWorkoutList[]>;
}