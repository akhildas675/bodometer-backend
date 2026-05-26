"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMapper = void 0;
class AuthMapper {
    static toRegisterResponse(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
    static toLoginResponse(user, accessToken, trainerStatus, onboardingComplete, hasActiveSubscription, profile) {
        return {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                userName: user.userName,
                email: user.email,
                phoneNumber: user.phoneNumber ?? "",
                profilePic: user.profilePic ?? null,
                gender: profile?.gender ?? null,
                role: user.role,
                isVerified: user.isVerified,
                dateOfBirth: profile?.dateOfBirth
                    ? new Date(profile.dateOfBirth).toISOString()
                    : null,
                isBlocked: user.isBlocked,
            },
            ...(trainerStatus && { trainerStatus }),
            ...(typeof onboardingComplete === "boolean" && { onboardingComplete }),
            ...(typeof hasActiveSubscription === "boolean" && {
                hasActiveSubscription,
            }),
        };
    }
}
exports.AuthMapper = AuthMapper;
