import { VerificationStatus } from "@/constants/verification.constants";
import { ITrainerProfileDocument } from "@/models/trainer-profile.model";
import { IUserDocument } from "@/models/user.model";
import { UserProfile } from "@/interfaces/user/user.interface";
import mongoose from "mongoose";



export interface TrainerWorkoutList {
  id: string;
  workoutName: string;
}

export interface TrainerProfileInterface extends UserProfile { };


export interface TrainerProfileRequest {
  experienceInYears: number;
  bio: string;
  certificateFile: Express.Multer.File;
}


export interface TrainerProfile {
  userId: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  experienceInYears: number,
  coverPhoto:string,
  certifications: string[],
  bio: string;
  applyCount: number;
}

export interface TrainerProfileDataInterface {
  userId: string;
  experienceInYears: number;
  certifications: string[];
  coverPhoto:string;
  bio: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  applyCount:number
}

export interface PopulatedTrainerProfile extends Omit<ITrainerProfileDocument, 'userId'> {
  userId: IUserDocument;
}

export interface ITrainerWithProfile {
  user: IUserDocument;
  profile: ITrainerProfileDocument;
}

export interface TrainerStatusResponse {
  name: string;
  verificationStatus: VerificationStatus
  rejectionReason?: string | null
}

export interface ReapplyTrainerData {
  experienceInYears: number;
  certifications: string[];
  bio: string;
  specializationIds: mongoose.Types.ObjectId[];
  coverPhoto:string;
}