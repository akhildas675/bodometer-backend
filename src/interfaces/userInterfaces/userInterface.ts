import { Gender, UserRoles } from "../../constants/identity.constants";


export interface IUser {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  profilePic?: string | null;
  gender?: Gender | null;
  role: UserRoles;
  isVerified:boolean;
  dateOfBirth?: Date | null;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface AccessTokenPayload {
  sub: string;
  role: UserRoles;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  role: UserRoles;
  sub: string;
  iat?: number;
  exp?: number;
}
