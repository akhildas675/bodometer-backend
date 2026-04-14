import { UserInterface } from "@/interfaces/user/user.interface";
import { LoginResponseDto, RegisterResponseDto } from "@/dto/auth/auth.dto";
import { VerificationStatus } from "@/constants/verification.constants";
import { SubscriptionStatus } from "@/constants/subscription";

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
  subscription?: {
    status: SubscriptionStatus;
    endDate: Date | null;
  }
): LoginResponseDto {
  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber ?? null,
      profilePic: user.profilePic ?? null,
      gender: user.gender ?? null,
      role: user.role,
      isVerified: user.isVerified,
      dateOfBirth: user.dateOfBirth?.toISOString() ?? null,
      isBlocked: user.isBlocked,

      subscription: subscription
        ? {
            status: subscription.status,
            endDate: subscription.endDate
              ? subscription.endDate.toISOString()
              : null,
          }
        : {
            status: "none",
            endDate: null,
          },
    },

    ...(trainerStatus && { trainerStatus }),
  };
}
}