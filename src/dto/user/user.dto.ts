import { Unit } from "@/constants/fitness.constant";
import { Gender } from "../../constants/identity.constants";
import { Role } from "../../constants/roles";
import { BaseUserProfileDto, PaginationQueryDto } from "../common.dto";

export interface FindUserDto {
  userId: string;
}

export interface FindUserResponseDto extends BaseUserProfileDto { }

export interface UpdateUserProfileDto {
  name?: string;
  userName?: string;
  phoneNumber?: string | null;
  gender?: Gender;
  profilePic?: string;
  dateOfBirth?: Date;
}

export interface UpdateUserProfileResponseDto {
  message: string;
  data: FindUserResponseDto;
}

export interface UploadProfilePictureResponseDto {
  url: string;
  message: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface AdminBaseUserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, "admin">;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
  profilePic?: string | null;
}

export interface AdminGetUsersDto extends PaginationQueryDto {
  role?: Exclude<Role, "admin">;
  isBlocked?: boolean;
}

export type AdminGetUsersResponseDto = AdminBaseUserResponseDto;

export interface AdminBlockUnBlockUserDto {
  userId: string;
}

export interface UpdateBmiDto {
  height: number;
  weight: number;
  unit: Unit,
  heightFt?: number;
  heightIn?: number;
}

export interface UpdateBmiResponseDto {
  bmi: number;
  heightCm: number;
  weightKg: number;
  category: {
    label: string;
    color: string;
    description: string;
    tips: string[];
  };
  healthyWeightRange: {
    minKg: number;
    maxKg: number;
  };
}