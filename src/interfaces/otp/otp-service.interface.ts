import { GenerateOtpDto, VerifyOtpDto } from "../../dto/otp/otp.dto";

export interface OtpServiceInterface {
  generateAndSendOtp(data: GenerateOtpDto): Promise<void>;
  verifyOtp(data: VerifyOtpDto): Promise<void>;
}