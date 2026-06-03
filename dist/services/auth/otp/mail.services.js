"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const appError_1 = require("../../../utils/appError");
const statuscode_1 = require("../../../constants/statuscode");
const messages_1 = require("../../../constants/messages");
class MailService {
    _transporter;
    constructor() {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
        if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, messages_1.MESSAGES.COMMON.SMTP_CONFIG_MISSING);
        }
        this._transporter = nodemailer_1.default.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: false,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });
    }
    async sendOtpEmail(email, otp) {
        await this._transporter.sendMail({
            from: `"Bodometer" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your OTP Verification Code",
            html: `<h2>Your OTP is ${otp}</h2>`,
        });
    }
}
exports.MailService = MailService;
