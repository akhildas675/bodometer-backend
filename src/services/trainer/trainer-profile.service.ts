import { VERIFICATION_STATUS } from "../../constants/verification.constants";
import { IS3Service } from "../../interfaces/s3/s3-service.interface";
import { ITrainerProfileRepository } from "../../interfaces/trainer/trainer.profile-repository.interface";
import { ITrainerProfileService } from "../../interfaces/trainer/trainer.profile-service.interface";
import { AppError } from "../../utils/appError";


export default class TrainerProfileService implements ITrainerProfileService {
  constructor(
    private _trainerProfileRepo: ITrainerProfileRepository,
    private _s3Service: IS3Service,
  ) {}
  

  async createProfile(
    userId: string,
    data: {
      experienceInYears: number;
      bio: string;
      certificateFile: Express.Multer.File;
    },
  ): Promise<void> {
    const existing = await this._trainerProfileRepo.findByUserId(userId);

    if (existing) {
      throw new AppError(400, "Trainer profile already exists");
    }

    const certificateUrl = await this._s3Service.uploadFile(
      data.certificateFile,
      "trainer-certificates",
    );

    await this._trainerProfileRepo.create({
      userId,
      experienceInYears: data.experienceInYears,
      certifications: [certificateUrl],
      bio: data.bio,
      verificationStatus: VERIFICATION_STATUS.PENDING,
      rejectionReason: null,
    });
  }
}
