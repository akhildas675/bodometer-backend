import nodemailer, { Transporter } from "nodemailer";
import { AppError } from "./appError";
import { STATUS } from "../constants/statuscode";


export class MailService {
  private transporter: Transporter;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        "SMTP configuration missing"
      );
    }

    this.transporter = nodemailer.createTransport({
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
    console.log('email for otp',email)
    try {
      await this.transporter.sendMail({
        from: `"Bodometer" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your OTP Verification Code",
        html: `
          <div style="font-family: Arial; line-height: 1.5;">
            <h2>OTP Verification</h2>
            <p>Your OTP code is:</p>
            <h1 style="letter-spacing: 6px;">${otp}</h1>
            <p>This OTP will expire in <b>5 minutes</b>.</p>
          </div>
        `,
      });
    } catch (error) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        "Failed to send OTP email"
      );
    }
  }
}
