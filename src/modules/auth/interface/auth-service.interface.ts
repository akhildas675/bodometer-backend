import { ForgotPasswordDto, ForgotPasswordResponseDto, GoogleLoginDto, GoogleLoginResponseDto, LoginDto, LoginResponseDto, OtpVerifyDto, RegisterDto, RegisterResponseDto, ResetPasswordDto } from "../dto/auth.dto";
import { ResendOtpDto } from "../../../dto/otp/otp.dto";

export interface IAuthService {
    requestRegistration(body: RegisterDto): Promise<void>;
    verifyOtp(body: OtpVerifyDto): Promise<void>;
    resendOtp(data:ResendOtpDto): Promise<void>;
    completeRegistration(data: RegisterDto): Promise<RegisterResponseDto>
    login(data: LoginDto): Promise<{ response: LoginResponseDto; refreshToken: string }>;
    googleLogin(data:GoogleLoginDto):Promise<{ response: GoogleLoginResponseDto; refreshToken: string }>;
    refreshAccessToken(refreshToken: string): Promise<LoginResponseDto>;
    logout(refreshToken: string): Promise<void>; 
    requestPasswordReset(data: ForgotPasswordDto): Promise<ForgotPasswordResponseDto>;
    resetPassword(data:ResetPasswordDto): Promise<void>;

}