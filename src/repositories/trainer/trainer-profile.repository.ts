import {
  TrainerProfile,
  TrainerProfileDataInterface,
} from "../../interfaces/trainer/trainer.interface";
import { ITrainerProfileRepository } from "../../interfaces/trainer/trainer.profile-repository.interface";
import { TrainerProfileModel } from "../../models/trainer-profile.model";

export default class TrainerProfileRepository implements ITrainerProfileRepository {
  async findByUserId(userId: string): Promise<TrainerProfile | null> {
    const doc = await TrainerProfileModel.findOne({ userId });
    if (!doc) return null;

    return {
      userId: doc.userId.toString(),
      verificationStatus: doc.verificationStatus,
      rejectionReason: doc.rejectionReason ?? null,
    };
  }

  async create(profile: TrainerProfileDataInterface): Promise<void> {
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
