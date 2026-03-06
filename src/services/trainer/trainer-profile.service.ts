import { MESSAGES } from "@/constants/messages";
import { STATUS } from "@/constants/statuscode";
import { VERIFICATION_STATUS } from "@/constants/verification.constants";
import { TrainerProfileDto } from "@/dto/trainer/trainer-profile.dto";
import { TrainerStatusResponseDto } from "@/dto/trainer/trainer.dto";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";
import { ITrainerRepository } from "@/interfaces/trainer/trainer-repository.interface";
import { ITrainerProfileRepository } from "@/interfaces/trainer/trainer.profile-repository.interface";
import { ITrainerProfileService } from "@/interfaces/trainer/trainer.profile-service.interface";
import { AppError } from "@/utils/appError";


export default class TrainerProfileService implements ITrainerProfileService {
  constructor(
    private _trainerProfileRepo: ITrainerProfileRepository,
    private _trainerRepository : ITrainerRepository,
    private _s3Service: IS3Service,
  ) { }


async createProfile(
  userId: string,
  data:TrainerProfileDto
): Promise<void> {

  const existing = await this._trainerProfileRepo.findByUserId(userId);


  if (existing?.verificationStatus === VERIFICATION_STATUS.PENDING) {
    throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.TRAINER_PROFILE_EXISTS);
  }


  if (existing?.verificationStatus === VERIFICATION_STATUS.APPROVED) {
    throw new AppError(STATUS.BAD_REQUEST, "Your profile is already approved");
  }

  
  if (existing?.verificationStatus === VERIFICATION_STATUS.REJECTED) {
    if (existing.applyCount >= 2) {
      throw new AppError(
        STATUS.FORBIDDEN,
        "You have reached the maximum number of applications. You cannot apply again."
      );
    }
  }


  const certificateUrl = await this._s3Service.uploadFile(
    data.certificateFile,
    "trainer-certificates",
  )

 const profileImageUrl = await this._s3Service.uploadFile(
    data.profileImageFile,
    "trainer-profile-images"
  );

   await this._trainerRepository.updateTrainerProfile(userId, {
      profilePic:  profileImageUrl,
      gender:      data.gender,
      dateOfBirth: new Date(data.dateOfBirth),
    });


  if (existing?.verificationStatus === VERIFICATION_STATUS.REJECTED) {
    await this._trainerProfileRepo.updateToReapply(userId, {
      experienceInYears: data.experienceInYears,
      certifications:    [certificateUrl],
      bio:               data.bio,
    });
    return;
  }


  await this._trainerProfileRepo.createProfile({
    userId,
    experienceInYears:  data.experienceInYears,
    certifications:     [certificateUrl],
    bio:                data.bio,
    verificationStatus: VERIFICATION_STATUS.PENDING,
    rejectionReason:    null,
    applyCount:         1,
  });
}

  async getTrainerStatus(userId: string): Promise<TrainerStatusResponseDto> {
    if (!userId) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND)
    }

    const response = await this._trainerProfileRepo.fetchTrainerStatus(userId);

    if (!response) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.TRAINER.TRAINERS_FETCHED_FAILED)
    }

    return response
  }
}
