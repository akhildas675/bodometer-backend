import { Gender } from "../../constants/identity.constants";
import { VerificationStatus } from "../../constants/verification.constants";
import { BaseUserProfileDto, BaseUserDto } from "../common.dto";

export interface CreateTrainerProfileDto {
  experienceInYears: number;
  bio: string;
  certificateUrl: string;
}
export interface TrainerProfileResponseDto extends BaseUserProfileDto {}
export interface GetTrainerAppointmentsResponseDto {
  user: BaseUserDto & { _id: string };
  profile: {
    _id: string;
    userId: string;
    experienceInYears: number;
    certifications: string[];
    bio: string;
    coverPhoto:string,
    verificationStatus: string;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
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
    coverPhoto:string;
    certifications: string[];
    bio: string;
    verificationStatus: string;
    rejectionReason: string | null;
    applyCount: number;
    createdAt: string;
    updatedAt: string;
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
}
export interface FindTrainerResponseDto extends BaseUserProfileDto {}
export interface TrainerStatusResponseDto {
  name: string,
  verificationStatus: VerificationStatus,
  rejectionReason?: string | null,
}

export interface TrainerProfileDto {
  profileImageFile: Express.Multer.File; 
  certificateFile: Express.Multer.File;   
  coverImageFile: Express.Multer.File; 
  dateOfBirth: string;
  gender: Gender;
  experienceInYears: number;            
  bio: string;

}