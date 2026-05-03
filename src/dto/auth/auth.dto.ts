import { OtpPurpose } from "../../constants/otp.constants";
import { Role } from "../../constants/roles";
import { VerificationStatus } from "../../constants/verification.constants";
import { BaseUserDto } from "../common.dto";

export interface RegisterDto {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: Role;
}


export interface RegisterResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginDto {
  id: string;
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;

  user: BaseUserDto;

  trainerStatus?: {
    profileExists: boolean;
    verificationStatus?: VerificationStatus;
    rejectionReason?: string | null;
  };
}
export interface OtpVerifyDto {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  role: "user" | "trainer" | "admin" | null;
}

export interface ResetPasswordDto {
  email: string;
  purpose:OtpPurpose;
  password: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface GoogleLoginResponseDto extends LoginResponseDto {}
