import {
  TrainerProfile,
  TrainerProfileDataInterface,
} from "../../interfaces/trainer/trainer.interface";
import { ITrainerProfileRepository } from "../../interfaces/trainer/trainer.profile-repository.interface";
import {
  ITrainerProfileDocument,
  TrainerProfileModel,
} from "../../models/trainer-profile.model";
import { BaseRepository } from "../base/base.repository";

export default class TrainerProfileRepository
  extends BaseRepository<TrainerProfile, ITrainerProfileDocument>
  implements ITrainerProfileRepository
{
  constructor() {
    super(TrainerProfileModel);
  }

  protected toInterface(doc: ITrainerProfileDocument): TrainerProfile {
    return {
      userId: doc.userId.toString(),
      verificationStatus: doc.verificationStatus,
      rejectionReason: doc.rejectionReason ?? null,
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
}