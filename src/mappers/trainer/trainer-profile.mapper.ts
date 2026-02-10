import { TrainerProfile, TrainerProfileDataInterface } from "../../interfaces/trainer/trainer.interface";
import { ITrainerProfileDocument } from "../../models/trainer-profile.model";

export class TrainerProfileMapper {
  static toInterface(doc: ITrainerProfileDocument): TrainerProfile {
    return {
      userId: doc.userId.toString(),
      verificationStatus: doc.verificationStatus,
      rejectionReason: doc.rejectionReason ?? null,
    };
  }

  static toDocument(profile: TrainerProfileDataInterface) {
    return {
      userId: profile.userId,
      experienceInYears: profile.experienceInYears,
      certifications: profile.certifications,
      bio: profile.bio,
      verificationStatus: profile.verificationStatus,
      rejectionReason: profile.rejectionReason ?? null,
    };
  }
}