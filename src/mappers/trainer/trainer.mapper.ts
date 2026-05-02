import { UserInterface } from "@/interfaces/domain.interface/user.interface/user.interface";

import { FindTrainerResponseDto } from "@/dto/trainer/trainer.dto";
import { Gender } from "@/constants/identity.constants";

export class TrainerMapper {
  static toProfileResponse(user: UserInterface): FindTrainerResponseDto {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber ?? "",
      gender: (user.gender as Gender) ?? null,   
      profilePic: user.profilePic ?? null,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
    };
  }

  static toProfileResponseList(users: UserInterface[]): FindTrainerResponseDto[] {
    return users.map((user) => this.toProfileResponse(user));
  }


}