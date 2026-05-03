import { generateOtp } from "@/utils/generateOtp";
import { redis } from "../../../config/redis";
import { MESSAGES } from "../../../constants/messages";
import { OtpPurpose } from "../../../constants/otp.constants";
import { STATUS } from "../../../constants/statuscode";
import { IMailService } from "../../../interfaces/service-interface/otp/mail-service.interface";
import { IOtpService } from "../../../interfaces/service-interface/otp/otp-service.interface";
import { GenerateOtpPayload, VerifyOtpPayload } from "../../../interfaces/service-interface/otp/otp.interface";
import { AppError } from "../../../utils/appError";



export class OtpService implements IOtpService {
  constructor(private _mailService: IMailService) {}

  private OTP_TTL = 300;
  private MAX_ATTEMPTS = 5;

  private otpKey(email: string, purpose: OtpPurpose) {
    return `otp:${purpose}:${email}`;
  }

  private attemptsKey(email: string, purpose: OtpPurpose) {
    return `otp_attempts:${purpose}:${email}`;
  }

  async generateAndSendOtp({
    email,
    purpose,
  }: GenerateOtpPayload): Promise<void> {
    const otp = generateOtp(6);
    console.log("Otp....", otp);

    await redis.set(this.otpKey(email, purpose), otp, "EX", this.OTP_TTL);
    await redis.del(this.attemptsKey(email, purpose));

    await this._mailService.sendOtpEmail(email, otp);
  }

  async verifyOtp({ email, otp, purpose }: VerifyOtpPayload): Promise<void> {
    const otpKey = this.otpKey(email, purpose);
    const attemptsKey = this.attemptsKey(email, purpose);
    const verifiedKey = `otp_verified:${purpose}:${email}`;

    const storedOtp = await redis.get(otpKey);

    console.log("Stored Otp", storedOtp);

    if (!storedOtp) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.OTP.INVALID_OTP);
    }

    const attempts = await redis.incr(attemptsKey);

    if (attempts > this.MAX_ATTEMPTS) {
      await redis.del(otpKey);
      await redis.del(attemptsKey);
      throw new AppError(STATUS.TOO_MANY_REQUESTS, MESSAGES.OTP.TOO_MANY_OTP_REQUESTS);
    }

    if (storedOtp !== otp) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.OTP.INVALID_OTP);
    }

    await redis.set(verifiedKey, "true", "EX", 10 * 60);

    // cleanup OTP
    await redis.del(otpKey);
    await redis.del(attemptsKey);
  }
}

