import { CategoryQuery, GetAllCategoriesResponse } from "../../../interfaces/domain.interface/category.interface";
import { FindTrainerResponseDto, TrainerProfileDto, TrainerStatusResponseDto, UpdateTrainerProfileDto } from "../../../dto/trainer/trainer.dto";


export interface ITrainerService {
  fetchTrainer(trainerId: string): Promise<FindTrainerResponseDto>;
  updateTrainerProfile(trainerId: string, updateData: UpdateTrainerProfileDto): Promise<FindTrainerResponseDto>;
  uploadTrainerProfilePicture(trainerId: string, file: Express.Multer.File): Promise<string>;
  uploadTrainerDocument(file: Express.Multer.File): Promise<string>;
  createProfile(userId: string, data: TrainerProfileDto): Promise<void>;
  getTrainerStatus(userId: string): Promise<TrainerStatusResponseDto>;
  getCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse>;
}