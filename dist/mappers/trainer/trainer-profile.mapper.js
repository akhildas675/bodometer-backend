"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerProfileMapper = void 0;
class TrainerProfileMapper {
    static toInterface(doc) {
        return {
            userId: doc.userId.toString(),
            experienceInYears: doc.experienceInYears,
            certifications: doc.certifications,
            coverPhoto: doc.coverPhoto,
            bio: doc.bio,
            specializations: doc.specializations?.map((id) => id.toString()) ?? [],
            gender: doc.gender,
            dateOfBirth: doc.dateOfBirth ?? null,
            verificationStatus: doc.verificationStatus,
            rejectionReason: doc.rejectionReason ?? null,
            applyCount: doc.applyCount,
        };
    }
    static toDocument(profile) {
        return {
            userId: profile.userId,
            experienceInYears: profile.experienceInYears,
            coverPhoto: profile.coverPhoto,
            certifications: profile.certifications,
            bio: profile.bio,
            verificationStatus: profile.verificationStatus,
            rejectionReason: profile.rejectionReason ?? null,
        };
    }
}
exports.TrainerProfileMapper = TrainerProfileMapper;
