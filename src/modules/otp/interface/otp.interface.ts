import { OtpPurpose } from "../../../constants/constant.values.ts/otp.constants";




export interface Otp {
  id: string;

  email: string;

  purpose: OtpPurpose;

  otp: string;

  attempts: number;

  resendCount: number;

  isVerified: boolean;

  otpExpiresAt: Date;

  resendWindowStartedAt: Date;

  resendWindowExpiresAt: Date;

  createdAt?: Date;

  updatedAt?: Date;
}

export interface CreateOtpData {
  email: string;
  purpose: string;
  otp: string;
  otpExpiresAt: Date;
  resendWindowStartedAt: Date;
  resendWindowExpiresAt: Date;
}

export interface UpdateOtpData {
  otp: string;
  otpExpiresAt: Date;
  resendCount: number;
  attempts: number;
  isVerified: boolean;
  resendWindowStartedAt: Date;
  resendWindowExpiresAt: Date;
}
