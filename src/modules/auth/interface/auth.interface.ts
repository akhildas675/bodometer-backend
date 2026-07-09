import { Gender } from "../../../constants/constant.values.ts/identity.constants";
import { Role } from "../../../constants/constant.values.ts/roles";



export interface UserInterface {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
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
