import { generateOtp } from "@/utils/generateOtp";
import { MESSAGES } from "../../constants/messages";
import { STATUS } from "../../constants/constant.values.ts/statuscode";
import { IMailService } from '@/modules/otp/interface/mail-service.interface';
import { IOtpService } from '@/modules/otp/interface/otp-service.interface';
import { GenerateOtpPayload, VerifyOtpPayload } from '@/modules/otp/interface/otp.interface';
import { AppError } from "../../utils/appError";
import { inject, injectable } from "inversify";
import { AUTH_TYPES } from "@/modules/auth/auth.types";
import { OtpModel } from "@/modules/otp/model/otp.model";

@injectable()
export class OtpService implements IOtpService {
  constructor(
    @inject(AUTH_TYPES.MailService)
    private _mailService: IMailService) {}

  private MAX_ATTEMPTS = 5;

  async generateAndSendOtp({
    email,
    purpose,
  }: GenerateOtpPayload): Promise<void> {
    const otp = generateOtp(6);
    console.log("Otp....", otp);

    const normalizedEmail = email.toLowerCase().trim();

    await OtpModel.deleteMany({ email: normalizedEmail, purpose });

    await OtpModel.create({
      email: normalizedEmail,
      purpose,
      otp,
      attempts: 0,
      isVerified: false,
      createdAt: new Date(),
    });

    await this._mailService.sendMail({
      to: normalizedEmail,
      subject: "Your OTP Verification Code",
      html: `<h2>Your OTP is ${otp}</h2>`,
    });
  }

  async verifyOtp({ email, otp, purpose }: VerifyOtpPayload): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await OtpModel.findOne({ email: normalizedEmail, purpose });

    if (!otpRecord) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.OTP.INVALID_OTP);
    }

    otpRecord.attempts += 1;

    if (otpRecord.attempts > this.MAX_ATTEMPTS) {
      await OtpModel.deleteOne({ _id: otpRecord._id });
      throw new AppError(STATUS.TOO_MANY_REQUESTS, MESSAGES.OTP.TOO_MANY_OTP_REQUESTS);
    }

    if (otpRecord.otp !== otp) {
      await otpRecord.save();
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.OTP.INVALID_OTP);
    }

    otpRecord.isVerified = true;
    await otpRecord.save();
  }
}
