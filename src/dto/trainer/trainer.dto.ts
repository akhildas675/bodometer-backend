import { Gender } from "../../constants/identity.constants";
import { VerificationStatus } from "../../constants/verification.constants";
import { BaseUserProfileDto, BaseUserDto, PaginationQueryDto, PaginatedResponseDto } from "../common.dto";
import { AdminBaseUserResponseDto } from "../user/user.dto";

export interface CreateTrainerProfileDto {
  experienceInYears: number;
  bio: string;
  certificateUrl: string;
}

export type TrainerProfileResponseDto = BaseUserProfileDto;

export interface GetTrainerAppointmentsResponseDto {
  user: BaseUserDto & { _id: string };
  profile: {
    _id: string;
    userId: string;
    experienceInYears: number;
    certifications: string[];
    bio: string;
    coverPhoto: string;
    verificationStatus: string;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
    specializations: { _id: string; name: string }[];
  };
}

export interface GetTrainerByIdRequestDto {
  userId: string;
}

export interface GetTrainerByIdResponseDto {
  user: BaseUserDto & { _id: string };
  profile: {
    _id: string;
    userId: string;
    experienceInYears: number;
    coverPhoto: string;
    certifications: string[];
    bio: string;
    verificationStatus: string;
    rejectionReason: string | null;
    applyCount: number;
    createdAt: string;
    updatedAt: string;
    specializations: { _id: string; name: string }[];
  };
}

export interface ApproveTrainerRequestDto {
  profileId: string;
}

export interface ApproveTrainerResponseDto {
  message: string;
  profile: {
    _id: string;
    verificationStatus: string;
  };
}

export interface RejectTrainerRequestDto {
  profileId: string;
  reason: string;
}

export interface RejectTrainerResponseDto {
  message: string;
  profile: {
    _id: string;
    verificationStatus: string;
    rejectionReason: string;
  };
}

export interface UpdateTrainerProfileDto {
  name?: string;
  userName?: string;
  phoneNumber?: string;
  gender?: Gender;
  profilePic?: string;
  dateOfBirth?: Date;  
  experienceInYears?: number;
  bio?: string;
  specializations?: string[];
}

export interface FindTrainerResponseDto extends BaseUserProfileDto {
  experienceInYears?: number;
  bio?: string;
  specializations?: string[];
  coverPhoto?: string;
  certifications?: string[];
}

export interface TrainerStatusResponseDto {
  name: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
}

export interface TrainerProfileDto {
  profileImageFile: Express.Multer.File; 
  certificateFile: Express.Multer.File;   
  coverImageFile: Express.Multer.File; 
  dateOfBirth: string;
  gender: Gender;
  experienceInYears: number;            
  bio: string;
  specializationIds: string[];
}

export interface GetTrainersQueryDto extends PaginationQueryDto {
  specializationId?: string;
}

export interface TrainerListItemDto {
  _id: string;
  name: string;
  profilePic: string | null;
  profileId: string;
  experienceInYears: number;
  coverPhoto: string;
  bio: string;
  specializations: { _id: string; name: string }[];
}

export type TrainerListResponseDto = PaginatedResponseDto<TrainerListItemDto>;

export interface RelatedTrainerDto {
  _id: string;
  name: string;
  profilePic: string | null;
  experienceInYears: number;
  bio: string;
}

export interface TrainerDetailDto {
  _id: string;
  name: string;
  profilePic: string | null;
  coverPhoto: string;
  bio: string;
  experienceInYears: number;
  specializations: { _id: string; name: string }[];
  relatedTrainers?: RelatedTrainerDto[];
}

export interface AdminGetTrainersDto extends PaginationQueryDto {
  isBlocked?: boolean;
}

export type AdminGetTrainersResponseDto = AdminBaseUserResponseDto;

export interface AdminBlockUnblockTrainerDto {
  trainerId: string;
}

export interface RejectTrainerBodyDto {
  reason: string;
}

export interface GetTrainerAppointmentsQueryDto extends PaginationQueryDto {
  status?: string;
}