import { GenerateOtpDto, VerifyOtpDto } from "../../../dto/otp/otp.dto";


export interface IOtpService {
  generateAndSendOtp(data: GenerateOtpDto): Promise<void>;
  verifyOtp(data: VerifyOtpDto): Promise<void>;
}