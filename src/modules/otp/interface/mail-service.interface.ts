export interface IMailService {
  sendMail(data: SendMailData): Promise<void>;
}

export interface SendMailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}