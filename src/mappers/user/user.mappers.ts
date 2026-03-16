import { UserInterface } from "@/interfaces/user/user.interface";
import { FindUserResponseDto } from "@/dto/user/user.dto";

export class UserMapper {
  static toFindUserResponse(user: UserInterface): FindUserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber ?? "",
      gender: user.gender ?? null,
      profilePic: user.profilePic ?? null,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
    };
  }
}