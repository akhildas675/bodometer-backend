import { STATUS } from "../../constants/statuscode";
import { FindTrainerResponseDto, UpdateTrainerProfileDto } from "../../dto/trainer/trainer.dto";
import { IS3Service } from "../../interfaces/s3/s3-service.interface";
import { ITrainerRepository } from "../../interfaces/trainer/trainer-repository.interface";
import { ITrainerService } from "../../interfaces/trainer/trainer-service.interface";
import { TrainerWorkoutList } from "../../interfaces/trainer/trainer.interface";
import { TrainerMapper } from "../../mappers/trainer/trainer.mapper";
import { AppError } from "../../utils/appError";

export class TrainerService implements ITrainerService {
  constructor(private _trainerRepo: ITrainerRepository,
    private _s3Service: IS3Service
  ) { }

  async fetchTrainer(trainerId: string): Promise<FindTrainerResponseDto> {
    const trainer = await this._trainerRepo.findById(trainerId)
    if (!trainer) {
      throw new AppError(STATUS.NOT_FOUND, "Trainer not found");
    }
    return TrainerMapper.toProfileResponse(trainer)
  }

  async updateTrainerProfile(trainerId: string, updateData: UpdateTrainerProfileDto): Promise<FindTrainerResponseDto> {
    if (Object.keys(updateData).length === 0) {
      throw new AppError(STATUS.BAD_REQUEST, "No fields to update")
    }

    if (updateData.gender && updateData.gender === "prefer_not_say") {
      throw new AppError(STATUS.BAD_REQUEST, "Please select a valid gender");
    }

    if (!updateData.dateOfBirth) {
      throw new AppError(STATUS.BAD_REQUEST, "Please select the date of birth");
    }

    const dob = new Date(updateData.dateOfBirth);
    const today = new Date();

    const limitDate = new Date(
      today.getFullYear() - 15,
      today.getMonth(),
      today.getDate(),
    );

    if (dob > limitDate) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "You must be at least 15 years old",
      );
    }

    const updatedUser = await this._trainerRepo.updateTrainerProfile(trainerId, updateData);

    if (!updatedUser) {
      throw new AppError(STATUS.NOT_FOUND, "User not found");
    }

    return TrainerMapper.toProfileResponse(updatedUser)


  }


  async uploadTrainerProfilePicture(
    trainerId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const trainer = await this._trainerRepo.findById(trainerId);
    if (!trainer) {
      throw new AppError(STATUS.NOT_FOUND, "User not found");
    }

    if (trainer.profilePic) {
      try {
        await this._s3Service.deleteFile(trainer.profilePic);
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
      }
    }

    const profilePicUrl = await this._s3Service.uploadFile(
      file,
      `profile-pictures/${trainerId}`,
    );

    await this._trainerRepo.updateTrainerProfile(trainerId, { profilePic: profilePicUrl });

    return profilePicUrl;
  }

  async fetchWorkoutList(): Promise<TrainerWorkoutList[]> {
    return this._trainerRepo.getWorkoutList();
  }
}
