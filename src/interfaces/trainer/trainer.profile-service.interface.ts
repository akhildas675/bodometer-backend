import { TrainerStatusResponseDto } from "@/dto/trainer/trainer.dto";
import { TrainerProfileRequest } from "./trainer.interface";

export interface ITrainerProfileService {
  createProfile(
    userId: string,
    data:TrainerProfileRequest
  ): Promise<void>;

  getTrainerStatus(userId:string):Promise<TrainerStatusResponseDto>
}
