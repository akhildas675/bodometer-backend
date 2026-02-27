import { VERIFICATION_STATUS } from "@/constants/verification.constants";
import {
  TrainerProfile,
  TrainerProfileDataInterface,
  TrainerStatusResponse,ReapplyTrainerData
} from "@/interfaces/trainer/trainer.interface";
import { ITrainerProfileRepository } from "@/interfaces/trainer/trainer.profile-repository.interface";
import {
  ITrainerProfileDocument,
  TrainerProfileModel,
} from "@/models/trainer-profile.model";
import { BaseRepository } from "@/repositories/base/base.repository";

export default class TrainerProfileRepository
  extends BaseRepository<TrainerProfile, ITrainerProfileDocument>
  implements ITrainerProfileRepository {
  constructor() {
    super(TrainerProfileModel);
  }

  protected toInterface(doc: ITrainerProfileDocument): TrainerProfile {
    return {
      userId: doc.userId.toString(),
      verificationStatus: doc.verificationStatus,
      rejectionReason: doc.rejectionReason ?? null,
      bio: doc.bio,
      certifications: doc.certifications,
      experienceInYears: doc.experienceInYears,
      applyCount:         doc.applyCount,
    };
  }

  async findByUserId(userId: string): Promise<TrainerProfile | null> {
    return this.findOne({ userId });
  }

  async createProfile(profile: TrainerProfileDataInterface): Promise<void> {
    await TrainerProfileModel.create({
      userId: profile.userId,
      experienceInYears: profile.experienceInYears,
      certifications: profile.certifications,
      bio: profile.bio,
      verificationStatus: profile.verificationStatus,
      rejectionReason: profile.rejectionReason ?? null,
    });
  }

  async updateToReapply(userId: string, data: ReapplyTrainerData): Promise<void> {
  await TrainerProfileModel.updateOne(
    { userId },
    {
      $set: {
        experienceInYears:  data.experienceInYears,
        certifications:     data.certifications,
        bio:                data.bio,
        verificationStatus: VERIFICATION_STATUS.PENDING,
        rejectionReason:    null,
      },
      $inc: { applyCount: 1 },
    }
  );
}

  async fetchTrainerStatus(userId: string): Promise<TrainerStatusResponse | null> {
    const profile = await TrainerProfileModel
      .findOne({ userId })
      .populate<{ userId: { name: string } }>("userId", "name");

    if (!profile) {
      throw new Error("Not found")
    }

    return {
      name: profile.userId.name,
      verificationStatus: profile.verificationStatus,
      rejectionReason: profile.rejectionReason ?? null,
    };
  }
}