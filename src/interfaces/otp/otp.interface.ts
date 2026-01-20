import { OtpPurpose } from "../../constants/otp.constants";

export interface GenerateOtpPayload {
  email: string;
  purpose: OtpPurpose
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  purpose: OtpPurpose
}