
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { MailService } from "../../utils/mailServices";
import { OtpModel, OtpPurpose } from "../../models/otpModel";
import { generateOtp } from "../../utils/generateOtp";

export class OtpService {
  private mailService = new MailService();

  private OTP_EXPIRY_MINUTES = 5;
  private MAX_ATTEMPTS = 5;

  async generateAndSendOtp(
    email: string,
    purpose: OtpPurpose
  ): Promise<void> {
    const otp = generateOtp(6);

    const expiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
    );

    // remove old OTPs
    await OtpModel.deleteMany({ email, purpose });

    await OtpModel.create({
      email,
      otp,
      purpose,
      expiresAt,
    });

    console.log("Email and otp otp service",email,otp)

    await this.mailService.sendOtpEmail(email, otp);
  }

  async verifyOtp(
    email: string,
    otp: string,
    purpose: OtpPurpose
  ): Promise<void> {
    const record = await OtpModel.findOne({ email, purpose });

    console.log("Record.....",record)

    if (!record) {
      throw new AppError(STATUS.BAD_REQUEST, "OTP not found or expired");
    }

    if (record.verified) {
      throw new AppError(STATUS.BAD_REQUEST, "OTP already used");
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      throw new AppError(
        STATUS.TOO_MANY_REQUESTS,
        "Too many invalid attempts"
      );
    }

    if (record.expiresAt < new Date()) {
      throw new AppError(STATUS.BAD_REQUEST, "OTP expired");
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      await record.save();
      throw new AppError(STATUS.BAD_REQUEST, "Invalid OTP");
    }

    record.verified = true;
    await record.save();

    console.log("After saving the record",record)
  }
}
