import { Gender } from "../../constants/identity.constants";
import { VerificationStatus } from "../../constants/verification.constants";

export interface CreateTrainerProfileDto {
  experienceInYears: number;
  bio: string;
  certificateUrl: string;
}
export interface TrainerProfileResponseDto {
  id: string;
  name: string;
  email: string;
  userName: string;
  phoneNumber: string;
  gender: string | null;
  profilePic: string | null;
  dateOfBirth: string | null;
}
export interface GetTrainerAppointmentsResponseDto {
  user: {
    _id: string;
    name: string;
    userName: string;
    email: string;
    phoneNumber: string |null;
    profilePic: string | null;
    gender: string;
    role: string;
    isVerified: boolean;
    dateOfBirth: string | null;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
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
  user: {
    _id: string;
    name: string;
    userName: string;
    email: string;
    phoneNumber: string | null;
    profilePic: string | null;
    gender: string;
    role: string;
    isVerified: boolean;
    dateOfBirth: string | null;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
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
export interface FindTrainerResponseDto {
  id: string;
  name: string;
  email: string;
  userName: string;
  phoneNumber: string;
  gender: Gender | null;       
  profilePic: string | null;
  dateOfBirth: string | null;
}
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