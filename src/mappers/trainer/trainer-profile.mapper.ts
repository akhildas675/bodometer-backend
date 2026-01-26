import { TrainerProfileResponseDto } from "../../dto/trainer/trainer.dto";

export class TrainerProfileMapper {
  static toResponse(): TrainerProfileResponseDto {
    return {
      success: true,
      message: "Trainer profile submitted successfully",
    };
  }
}
