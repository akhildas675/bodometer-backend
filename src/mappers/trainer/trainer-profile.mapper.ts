import { TrainerProfile } from "@/interfaces/domain.interface/trainer.interface/trainer.interface";
import { ITrainerProfileDocument } from "@/models/trainer-profile.model";

export class TrainerProfileMapper {
  static toInterface(doc: ITrainerProfileDocument): TrainerProfile {
     return {
    userId:             doc.userId.toString(),
    experienceInYears:  doc.experienceInYears,
    certifications:     doc.certifications,
    coverPhoto:         doc.coverPhoto,
    bio:                doc.bio,
    specializations:    doc.specializations?.map(id => id.toString()) ?? [],
    gender:             doc.gender,
    dateOfBirth:        doc.dateOfBirth ?? null,
    verificationStatus: doc.verificationStatus,
    rejectionReason:    doc.rejectionReason ?? null,
    applyCount:         doc.applyCount, 
  };
  }

  static toDocument(profile: TrainerProfile) {
    return {
      userId: profile.userId,
      experienceInYears: profile.experienceInYears,
      coverPhoto       : profile.coverPhoto,
      certifications: profile.certifications,
      bio: profile.bio,
      verificationStatus: profile.verificationStatus,
      rejectionReason: profile.rejectionReason ?? null,
    };
  }
}