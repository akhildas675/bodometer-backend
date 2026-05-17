import { UserInterface } from "@/interfaces/domain.interface/user.interface";

import { FindTrainerResponseDto } from "@/dto/trainer/trainer.dto";

export class TrainerMapper {
  static toProfileResponse(
    user: UserInterface,
    profile?: {
      gender?: string | null;
      dateOfBirth?: Date | string | null;
      experienceInYears?: number;
      coverPhoto?: string;
      certifications?: string[];
      bio?: string;
      specializations?: string[];
    } | null,
  ): FindTrainerResponseDto {
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

  static toProfileResponseList(
    users: UserInterface[],
  ): FindTrainerResponseDto[] {
    return users.map((user) => this.toProfileResponse(user));
  }
}
