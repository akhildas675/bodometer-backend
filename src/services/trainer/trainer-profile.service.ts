import { VERIFICATION_STATUS } from "../../constants/verification.constants";
import { TrainerProfileRepositoryInterface } from "../../interfaces/trainer/trainer.profile-repository.interface";
import { TrainerProfileServiceInterface } from "../../interfaces/trainer/trainer.profile-service.interface";
import { AppError } from "../../utils/appError";
import { S3Service } from "../s3/s3.service";


export default class TrainerProfileService
  implements TrainerProfileServiceInterface {

  private s3Service = new S3Service();

  constructor(
    private trainerProfileRepo: TrainerProfileRepositoryInterface
  ) {}

  async createProfile(
    userId: string,
    data: {
      experienceInYears: number;
      bio: string;
      certificateFile: Express.Multer.File;
    }
  ): Promise<void> {

    const existing =
      await this.trainerProfileRepo.findByUserId(userId);

    if (existing) {
      throw new AppError(400, "Trainer profile already exists");
    }

 
    const certificateUrl = await this.s3Service.uploadFile(
      data.certificateFile,
      "trainer-certificates"
    );

    await this.trainerProfileRepo.create({
      userId,
      experienceInYears: data.experienceInYears,
      certifications: [certificateUrl],
      bio: data.bio,
      verificationStatus: VERIFICATION_STATUS.PENDING,
      rejectionReason: null,
    });
  }
}
