import { LoginUserDto, RegisterUserDto, RegisterResponseDto, LoginResponseDto } from "../../dto/user/user-auth.dto";

export interface IAuthService {
    registerUser(data: RegisterUserDto): Promise<RegisterResponseDto>
    loginUser(data: LoginUserDto): Promise<LoginResponseDto>
    refreshToken(refreshToken: string): Promise<{ accessToken: string }>;

}