import nodemailer, { Transporter } from "nodemailer";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/constant.values.ts/statuscode";
import { MESSAGES } from "../../constants/messages";

import { injectable } from "inversify";
import { IMailService, SendMailData } from "@/modules/otp/interface/mail-service.interface";

@injectable()
export class MailService implements IMailService {
  private _transporter: Transporter;

  constructor() {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.COMMON.SMTP_CONFIG_MISSING,
      );
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

  async sendMail(data: SendMailData): Promise<void> {
    await this._transporter.sendMail({
      from: `"Bodometer" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
  }
}