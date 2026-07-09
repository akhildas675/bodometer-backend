import { Unit } from "../../../constants/constant.values.ts/fitness.constant";
import { Gender } from "../../../constants/constant.values.ts/identity.constants";
import { Role } from "../../../constants/constant.values.ts/roles";
import { BaseUserProfileDto, PaginationQueryDto } from "../../../dto/common.dto";

export interface FindUserDto {
  userId: string;
}

export type FindUserResponseDto = BaseUserProfileDto

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

export interface BaseUserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, "admin">;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
  profilePic?: string | null;
}

export interface GetUsersDto extends PaginationQueryDto {
  role?: Exclude<Role, "admin">;
  isBlocked?: boolean;
}

export type GetUsersResponseDto = BaseUserResponseDto;

export interface BlockUnblockUserDto {
  userId: string;
}

export interface UpdateBmiDto {
  height: number;
  weight: number;
  unit: Unit;
  heightFt?: number;
  heightIn?: number;
  gender?: Gender;
}

export interface UpdateBmiResponseDto {
  bmi: number;
  heightCm: number;
  weightKg: number;
  gender?: Gender;
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