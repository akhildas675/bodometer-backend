"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerMapper = void 0;
class TrainerMapper {
    static toProfileResponse(user, profile) {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            userName: user.userName,
            phoneNumber: user.phoneNumber ?? "",
            gender: profile?.gender ?? null,
            profilePic: user.profilePic ?? null,
            dateOfBirth: profile?.dateOfBirth
                ? new Date(profile.dateOfBirth).toISOString()
                : null,
            experienceInYears: profile?.experienceInYears ?? 0,
            coverPhoto: profile?.coverPhoto ?? "",
            certifications: profile?.certifications ?? [],
            bio: profile?.bio ?? "",
            specializations: profile?.specializations ?? [],
        };
    }
    static toProfileResponseList(users) {
        return users.map((user) => this.toProfileResponse(user));
    }
}
exports.TrainerMapper = TrainerMapper;
