import { Gender } from "../../constants/identity.constants";
import { Role } from "../../constants/roles";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  userName: string;
  phoneNumber: string | null;
  gender: Gender;
  profilePic: string | null;
  dateOfBirth: Date | null;
}

export interface UpdateUserProfileInterface {
  name?: string;
  userName?: string;
  phoneNumber?: string | null;
  gender?: Gender;
  profilePic?: string;
  dateOfBirth?: Date;
}

export interface UserInterface {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  password: string;
  profilePic?: string | null;
  role: Role;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAccountInterface<R extends Role> {
  id: string;
  name: string;
  email: string;
  role: R;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
}

export type AdminUserInterface = AdminAccountInterface<"user">;
export type AdminTrainerInterface = AdminAccountInterface<"trainer">;
