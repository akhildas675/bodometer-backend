import { UserProfile } from "../../interfaces/user/user.interface";
import { FindUserResponseDto } from "../../dto/user/user.dto";

export class UserMapper {
  static toFindUserResponse(user: UserProfile): FindUserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      ...(user.profilePic !== null && { profilePic: user.profilePic }),
      ...(user.dateOfBirth !== null && { dateOfBirth: user.dateOfBirth }),
    };
  }
}
