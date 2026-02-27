import nodemailer, { Transporter } from "nodemailer";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/statuscode";
import { IMailService } from "@/interfaces/otp/mail-service.interface";

export class MailService implements IMailService {
  private _transporter: Transporter;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      throw new AppError(STATUS.INTERNAL_ERROR, "SMTP configuration missing");
    }

    this._transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    await this._transporter.sendMail({
      from: `"Bodometer" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Verification Code",
      html: `<h2>Your OTP is ${otp}</h2>`,
    });
  }
}
