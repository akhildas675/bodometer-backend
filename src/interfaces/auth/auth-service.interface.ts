import { LoginResponseDto, LoginDto, OtpVerifyDto, RegisterDto, RegisterResponseDto, ForgotPasswordDto, ForgotPasswordResponseDto, GoogleLoginDto, GoogleLoginResponseDto, ResetPasswordDto,  } from "../../dto/auth/auth.dto";
import { ResendOtpDto } from "../../dto/otp/otp.dto";

export interface IAuthService {
    initiateRegister(body: RegisterDto): Promise<void>;
    verifyOtp(body: OtpVerifyDto): Promise<void>;
    register(data: RegisterDto): Promise<RegisterResponseDto>
    resendOtp(data:ResendOtpDto): Promise<void>;
    login(data: LoginDto): Promise<{ response: LoginResponseDto; refreshToken: string }>;
    googleLogin(data:GoogleLoginDto):Promise<GoogleLoginResponseDto>
    refreshAccessToken(refreshToken: string): Promise<LoginResponseDto>;
    logout(refreshToken: string): Promise<void>; 
    forgotPassword(data: ForgotPasswordDto): Promise<ForgotPasswordResponseDto>;
    resetPassword(data:ResetPasswordDto): Promise<void>;

}