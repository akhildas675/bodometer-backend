import { redis } from "../../config/redis";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { MailService } from "./mail.services";
import { generateOtp } from "../../utils/generateOtp";
import { OtpPurpose } from "../../constants/otp.constants";
import { AuthServiceInterface } from "../../interfaces/auth/auth-service.interface";
import { OtpServiceInterface } from "../../interfaces/otp/otp-service.interface";
import { GenerateOtpDto, VerifyOtpDto } from "../../dto/otp/otp.dto";
import { MailServiceInterface } from "../../interfaces/otp/mail-service.interface";


export class OtpService implements OtpServiceInterface {
  constructor(
    private mailService: MailServiceInterface
  ) { }

  private OTP_TTL = 300;
  private MAX_ATTEMPTS = 5;

  private otpKey(email: string, purpose: OtpPurpose) {
    return `otp:${purpose}:${email}`;
  }

  private attemptsKey(email: string, purpose: OtpPurpose) {
    return `otp_attempts:${purpose}:${email}`;
  }

  async generateAndSendOtp(
    { email, purpose }: GenerateOtpDto
  ): Promise<void> {

    const otp = generateOtp(6);
    console.log("Otp....", otp)

    await redis.set(this.otpKey(email, purpose), otp, "EX", this.OTP_TTL);
    await redis.del(this.attemptsKey(email, purpose));

    await this.mailService.sendOtpEmail(email, otp);
  }

  async verifyOtp({ email, otp, purpose }: VerifyOtpDto): Promise<void> {
  const otpKey = this.otpKey(email, purpose);
  const attemptsKey = this.attemptsKey(email, purpose);
  const verifiedKey = `otp_verified:${purpose}:${email}`;

  const storedOtp = await redis.get(otpKey);

  console.log("Stored Otp", storedOtp);

  if (!storedOtp) {
    throw new AppError(STATUS.BAD_REQUEST, "OTP expired or not found");
  }

  const attempts = await redis.incr(attemptsKey);

  if (attempts > this.MAX_ATTEMPTS) {
    await redis.del(otpKey);
    await redis.del(attemptsKey);
    throw new AppError(
      STATUS.TOO_MANY_REQUESTS,
      "Too many invalid attempts"
    );
  }

  if (storedOtp !== otp) {
    throw new AppError(STATUS.BAD_REQUEST, "Invalid OTP");
  }

 
  await redis.set(
    verifiedKey,
    "true",
    "EX",
    10 * 60
  );

  // cleanup OTP
  await redis.del(otpKey);
  await redis.del(attemptsKey);
}

}
