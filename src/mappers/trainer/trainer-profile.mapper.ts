import { TrainerProfile, TrainerProfileDataInterface } from "../../interfaces/trainer/trainer.interface";
import { ITrainerProfileDocument } from "../../models/trainer-profile.model";

export class TrainerProfileMapper {
  static toInterface(doc: ITrainerProfileDocument): TrainerProfile {
     return {
    userId:             doc.userId.toString(),
    experienceInYears:  doc.experienceInYears,
    certifications:     doc.certifications,
    bio:                doc.bio,
    verificationStatus: doc.verificationStatus,
    rejectionReason:    doc.rejectionReason ?? null,
    applyCount:         doc.applyCount, 
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