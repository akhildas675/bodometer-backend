import { RegisterUserDto, UserResponseDto } from "../../dto/user/user-auth.dto";

export interface IAuthService{
    registerUser(data:RegisterUserDto):Promise<UserResponseDto>
}