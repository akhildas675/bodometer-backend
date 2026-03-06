import { TrainerStatusResponseDto } from "@/dto/trainer/trainer.dto";
import { TrainerProfileDto } from "@/dto/trainer/trainer-profile.dto";

export interface ITrainerProfileService {
  createProfile(
    userId: string,
    data:TrainerProfileDto
  ): Promise<void>;

  getTrainerStatus(userId:string):Promise<TrainerStatusResponseDto>
}
