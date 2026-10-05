import { inject, injectable } from "inversify";

import { generateOtp } from "@/utils/generateOtp";

import { AUTH_TYPES } from "@/modules/auth/auth.types";

import { IMailService } from "@/modules/otp/interface/mail-service.interface";
import { IOtpService } from "@/modules/otp/interface/otp-service.interface";

import { IOtpRepository } from "@/modules/otp/interface/otp-repository.interface";
import { OTP_CONFIG } from "../constant/otp.constant";
import { GenerateOtpPayload, VerifyOtpPayload } from "../dto/otp.dto";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { otpEmailTemplate } from "@/utils/otp.templete";

@injectable()
export class OtpService implements IOtpService {
  constructor(
    @inject(AUTH_TYPES.MailService)
    private readonly _mailService: IMailService,

    @inject(AUTH_TYPES.OtpRepository)
    private readonly _otpRepository: IOtpRepository,
  ) {}

  async generateAndSendOtp({
    email,
    purpose,
  }: GenerateOtpPayload): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    const now = new Date();

    const otp = generateOtp(OTP_CONFIG.LENGTH);

    const otpExpiresAt = new Date(
      now.getTime() + OTP_CONFIG.OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    const resendWindowExpiresAt = new Date(
      now.getTime() + OTP_CONFIG.RESEND_WINDOW_HOURS * 60 * 60 * 1000,
    );

    const existingOtp = await this._otpRepository.findByEmailAndPurpose(
      normalizedEmail,
      purpose,
    );

    if (!existingOtp) {
      await this._otpRepository.create({
        email: normalizedEmail,
        purpose,
        otp,
        attempts: 0,
        isVerified: false,

        otpExpiresAt,

        resendCount: 0,

        resendWindowStartedAt: now,

        resendWindowExpiresAt,

        createdAt: now,
      });

      await this._sendOtpEmail(normalizedEmail, otp);

      return;
    }

    if (existingOtp.isVerified) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.OTP.INVALID_OTP);
    }

    const resendWindowExpired = now >= existingOtp.resendWindowExpiresAt;

    if (resendWindowExpired) {
      await this._otpRepository.updateOtp(existingOtp.id, {
        otp,
        attempts: 0,
        isVerified: false,

        otpExpiresAt,

        resendCount: 0,

        resendWindowStartedAt: now,

        resendWindowExpiresAt,
      });

      await this._sendOtpEmail(normalizedEmail, otp);

      return;
    }

    if (existingOtp.resendCount >= OTP_CONFIG.MAX_RESEND_COUNT) {
      throw new AppError(
        STATUS.TOO_MANY_REQUESTS,
        "Maximum OTP resend limit reached. Please try again after 2 hours.",
      );
    }

    await this._otpRepository.updateOtp(existingOtp.id, {
      otp,
      attempts: 0,
      isVerified: false,

      otpExpiresAt,

      resendCount: existingOtp.resendCount + 1,

      resendWindowStartedAt: existingOtp.resendWindowStartedAt,

      resendWindowExpiresAt: existingOtp.resendWindowExpiresAt,
    });

    await this._sendOtpEmail(normalizedEmail, otp);
  }

  async verifyOtp({ email, otp, purpose }: VerifyOtpPayload): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await this._otpRepository.findByEmailAndPurpose(
      normalizedEmail,
      purpose,
    );

    if (!otpRecord) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.OTP.INVALID_OTP);
    }

    if (otpRecord.isVerified) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.OTP.INVALID_OTP);
    }

    const now = new Date();

    if (now >= otpRecord.otpExpiresAt) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.OTP.INVALID_OTP);
    }

    if (otpRecord.attempts >= OTP_CONFIG.MAX_VERIFY_ATTEMPTS) {
      await this._otpRepository.deleteById(otpRecord.id);

      throw new AppError(
        STATUS.TOO_MANY_REQUESTS,
        MESSAGES.OTP.TOO_MANY_OTP_REQUESTS,
      );
    }

    if (otpRecord.otp !== otp) {
      await this._otpRepository.updateOtp(otpRecord.id, {
        attempts: otpRecord.attempts + 1,
      });

      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.OTP.INVALID_OTP);
    }

    await this._otpRepository.updateOtp(otpRecord.id, {
      isVerified: true,
    });
  }

  private async _sendOtpEmail(email: string, otp: string): Promise<void> {
    await this._mailService.sendMail({
      to: email,

      subject: "Your Bodometer Verification Code",

      html: otpEmailTemplate(otp),

      text: `
Your Bodometer verification code is: ${otp}

This code is valid for ${OTP_CONFIG.OTP_EXPIRY_MINUTES} minutes.

If you did not request this code, you can safely ignore this email.
      `.trim(),
    });
  }
}
