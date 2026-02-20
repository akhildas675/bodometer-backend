import { Gender, Role } from "../../constants/identity.constants";
import { OtpPurpose } from "../../constants/otp.constants";


export interface UserInterface {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  profilePic?: string | null;
  gender?: Gender | null;
  role: Role;
  isVerified:boolean;
  dateOfBirth?: Date | null;
  isBlocked: boolean;
  createdAt?: Date | string;
  updatedAt?: Date;
}


export interface AccessTokenPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  role: Role;
  sub: string;
  iat?: number;
  exp?: number;
}

export interface SessionData {
  id: string;
  email: string;
  role: string;
  isBlocked: boolean;
}
