import { UserInterface } from "../interfaces/auth/auth.interface";
import { RegisterResponseDto, LoginResponseDto, } from "../dto/auth/auth.dto";

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
  accessToken: string
): LoginResponseDto {
  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
  };
}


}
