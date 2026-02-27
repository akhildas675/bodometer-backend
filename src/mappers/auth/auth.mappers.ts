import { UserInterface } from "@/interfaces/auth/auth.interface";
import { RegisterResponseDto, LoginResponseDto } from "@/dto/auth/auth.dto";

export class AuthMapper {
  static toRegisterResponse(user: UserInterface): RegisterResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userName: user.userName ?? null,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profilePic: user.profilePic ?? null,
    };
  }

  static toLoginResponse(
    user: UserInterface,
    accessToken: string,
    trainerStatus?: LoginResponseDto["trainerStatus"],
  ): LoginResponseDto {
    const baseResponse: LoginResponseDto = {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };

    if (trainerStatus) {
      baseResponse.trainerStatus = trainerStatus;
    }

    return baseResponse;
  }
}
