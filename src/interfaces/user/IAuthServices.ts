import { LoginUserDto, RegisterUserDto, RegisterResponseDto, LoginResponseDto } from "../../dto/user/user-auth.dto";

export interface IAuthService {
    initiateRegister(body: RegisterUserDto): Promise<void>;
    registerUser(data: RegisterUserDto): Promise<RegisterResponseDto>
    resendOtp(email:string):Promise<void>;
    loginUser(data: LoginUserDto): Promise<LoginResponseDto>
    refreshToken(refreshToken: string): Promise<{ accessToken: string }>;
    

}