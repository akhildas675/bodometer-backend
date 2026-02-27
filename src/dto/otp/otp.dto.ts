import { OtpPurpose } from "@/constants/otp.constants";

export interface GenerateOtpDto {
  email: string;
  purpose: OtpPurpose | string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface ResendOtpDto {
  email: string;
  purpose: OtpPurpose;
}
