import { Role } from "../../constants/identity.constants";
import { OtpPurpose } from "../../constants/otp.constants";

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
    role: Role;
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

export interface GoogleLoginResponseDto{
  
}