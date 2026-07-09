import { Gender } from '@/constants/constant.values.ts/identity.constants';
import { Role } from '@/constants/constant.values.ts/roles';

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

export interface AccountInterface<R extends Role> {
  id: string;
  name: string;
  email: string;
  role: R;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
}

export type UserAccountInterface = AccountInterface<"user">;
export type TrainerAccountInterface = AccountInterface<"trainer">;
