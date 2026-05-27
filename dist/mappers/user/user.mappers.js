"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMappers = exports.UserMapper = void 0;
class UserMapper {
    static toFindUserResponse(user, profile) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            userName: user.userName,
            phoneNumber: user.phoneNumber ?? "",
            gender: profile?.gender ?? null,
            profilePic: user.profilePic ?? null,
            dateOfBirth: profile?.dateOfBirth
                ? new Date(profile.dateOfBirth).toISOString()
                : null,
        };
    }
}
exports.UserMapper = UserMapper;
class UserMappers {
    static toListItemDto(trainer) {
        return {
            _id: trainer.user._id?.toString() || "",
            profileId: trainer.profile._id.toString(),
            name: trainer.user.name,
            profilePic: trainer.user.profilePic || null,
            experienceInYears: trainer.profile.experienceInYears,
            bio: trainer.profile.bio,
            coverPhoto: trainer.profile.coverPhoto,
            specializations: (trainer.profile.specializations || []).map((spec) => ({
                _id: String(spec._id),
                name: spec.name || "",
            })),
        };
    }
    static toListItemDtoArray(trainers) {
        return trainers.map((t) => this.toListItemDto(t));
    }
    static toTrainerDetailDto(data) {
        return {
            _id: data.profile._id.toString(),
            name: data.user.name,
            profilePic: data.user.profilePic ?? null,
            coverPhoto: data.profile.coverPhoto ?? "",
            bio: data.profile.bio,
            experienceInYears: data.profile.experienceInYears,
            specializations: (data.profile.specializations || []).map((spec) => ({
                _id: String(spec._id),
                name: spec.name || "",
            })),
        };
    }
}
exports.UserMappers = UserMappers;
