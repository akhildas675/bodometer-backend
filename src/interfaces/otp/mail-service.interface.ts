export interface MailServiceInterface {
  sendOtpEmail(email: string, otp: string): Promise<void>;
}