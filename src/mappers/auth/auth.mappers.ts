import { VerificationStatus } from "../../constants/verification.constants";
import { LoginResponseDto, RegisterResponseDto } from "../../dto/auth/auth.dto";
import { UserInterface } from "../../interfaces/service-interface/auth/auth.interface";


export class AuthMapper {
  static toRegisterResponse(user: UserInterface): RegisterResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  static toLoginResponse(
    user: UserInterface,
    accessToken: string,
    trainerStatus?: {
      profileExists: boolean;
      verificationStatus?: VerificationStatus;
      rejectionReason?: string | null;
    },
    onboardingComplete?: boolean,
    hasActiveSubscription?: boolean,
    profile?: { gender?: string | null; dateOfBirth?: Date | string | null } | null
  ): LoginResponseDto {
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
        dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : null,
        isBlocked: user.isBlocked,
      },

      ...(trainerStatus && { trainerStatus }),
      ...(typeof onboardingComplete === "boolean" && { onboardingComplete }),
      ...(typeof hasActiveSubscription === "boolean" && { hasActiveSubscription }),
    };
  }
}