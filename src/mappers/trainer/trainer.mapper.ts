import { UserInterface } from "@/interfaces/domain.interface/user.interface";

import { FindTrainerResponseDto } from "@/dto/trainer/trainer.dto";


export class TrainerMapper {
  static toProfileResponse(
    user: UserInterface,
    profile?: { gender?: string | null; dateOfBirth?: Date | string | null } | null
  ): FindTrainerResponseDto {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber ?? "",
      gender: profile?.gender ?? null,   
      profilePic: user.profilePic ?? null,
      dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : null,
    };
  }

  static toProfileResponseList(users: UserInterface[]): FindTrainerResponseDto[] {
    return users.map((user) => this.toProfileResponse(user));
  }


}