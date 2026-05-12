import mongoose from "mongoose";
import { VerificationStatus } from "../../../constants/verification.constants";
import { ITrainerProfileDocument } from "../../../models/trainer-profile.model";
import { IUserDocument } from "../../../models/user.model";
import { UserProfile } from "../user.interface/user.interface";
import {Multer} from 'multer'




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
  specializations: string[];
  applyCount: number;
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
  specializations: string[];
  coverPhoto:string;
}