import { Role } from "../../constants/identity.constants";
import { OtpPurpose } from "../../constants/otp.constants";
import { VerificationStatus } from "../../constants/verification.constants";

export interface RegisterDto {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role:Role;
}

export interface RegisterResponseDto {
  id: string;
  name: string;
  email: string;
  userName:string | null;
  phoneNumber: string;
  role: Role;
  profilePic: string | null;
}


export interface LoginDto{
  id:string;
  email:string;
  password:string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
  };
  trainerStatus?: {
    profileExists: boolean;
    verificationStatus?: VerificationStatus;
    rejectionReason?: string | null;
  };
}



export interface OtpVerifyDto{
  email:string;
  otp:string;
  purpose:OtpPurpose
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  role: "user" | "trainer" | "admin" | null;
}

export interface ResetPasswordDto{
  email:string,
  password:string,
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface GoogleLoginResponseDto extends LoginResponseDto{}
