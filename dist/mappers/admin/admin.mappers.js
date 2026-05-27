"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerMapper = exports.AdminAccountMapper = void 0;
// Admin Account Mapper (User & Trainer list)
class AdminAccountMapper {
    static toResponse(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
            isVerified: user.isVerified,
            createdAt: user.createdAt.toISOString(),
            profilePic: user.profilePic || null,
        };
    }
    static toResponseList(users) {
        return users.map((u) => AdminAccountMapper.toResponse(u));
    }
}
exports.AdminAccountMapper = AdminAccountMapper;
// --- TRAINERS ---
class TrainerMapper {
    static mapTrainerUser(user, profile) {
        return {
            _id: user._id?.toString() || "",
            id: user._id?.toString() || "",
            name: user.name,
            userName: user.userName,
            email: user.email,
            phoneNumber: user.phoneNumber || null,
            profilePic: user.profilePic || null,
            gender: profile.gender,
            role: user.role,
            isVerified: user.isVerified,
            dateOfBirth: profile.dateOfBirth?.toISOString() || null,
            isBlocked: user.isBlocked,
            createdAt: user.createdAt?.toISOString() || "",
            updatedAt: user.updatedAt?.toISOString() || "",
        };
    }
    static mapTrainerBaseProfile(profile) {
        return {
            _id: profile._id?.toString() || "",
            userId: profile.userId.toString(),
            experienceInYears: profile.experienceInYears,
            certifications: profile.certifications ?? [],
            bio: profile.bio,
            coverPhoto: profile.coverPhoto,
            verificationStatus: profile.verificationStatus,
            rejectionReason: profile.rejectionReason || null,
            createdAt: profile.createdAt?.toISOString() || "",
            updatedAt: profile.updatedAt?.toISOString() || "",
            specializations: (profile.specializations || []).map((spec) => ({
                _id: String(spec._id),
                name: spec.name || "",
            })),
        };
    }
    static toDto(trainer) {
        return {
            user: this.mapTrainerUser(trainer.user, trainer.profile),
            profile: this.mapTrainerBaseProfile(trainer.profile),
        };
    }
    static toDtoArray(trainers) {
        return trainers.map((t) => TrainerMapper.toDto(t));
    }
    static toDetailDto(trainer) {
        const baseProfile = this.mapTrainerBaseProfile(trainer.profile);
        return {
            user: this.mapTrainerUser(trainer.user, trainer.profile),
            profile: {
                ...baseProfile,
                applyCount: trainer.profile.applyCount ?? 0,
            },
        };
    }
    static toApproveDto(profile) {
        return {
            message: "Trainer approved successfully",
            profile: {
                _id: profile._id?.toString() || "",
                verificationStatus: profile.verificationStatus,
            },
        };
    }
    static toRejectDto(profile) {
        return {
            message: "Trainer rejected successfully",
            profile: {
                _id: profile._id?.toString() || "",
                verificationStatus: profile.verificationStatus,
                rejectionReason: profile.rejectionReason || "",
            },
        };
    }
}
exports.TrainerMapper = TrainerMapper;
