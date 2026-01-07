import { LoginResponseDto, LoginDto, OtpVerifyDto, RegisterDto, RegisterResponseDto, ForgotPasswordDto, ForgotPasswordResponseDto } from "../../dto/auth/auth.dto";
import { ResendOtpDto } from "../../dto/otp/otp.dto";

export interface AuthServiceInterface {
    initiateRegister(body: RegisterDto): Promise<void>;
    verifyOtp(body: OtpVerifyDto): Promise<void>;
    register(data: RegisterDto): Promise<RegisterResponseDto>
    resendOtp(data:ResendOtpDto): Promise<void>;
    login(data: LoginDto): Promise<LoginResponseDto>
    forgotPassword(data: ForgotPasswordDto): Promise<ForgotPasswordResponseDto>;
    resetPassword(email: string, password: string): Promise<void>;

}