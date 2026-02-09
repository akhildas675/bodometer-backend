import { VerificationStatus } from "../../constants/verification.constants";
import { ITrainerProfileDocument } from "../../models/trainer-profile.model";
import { IUserDocument } from "../../models/user.model";
import { UserProfile } from "../user/user.interface";

export interface TrainerWorkoutList {
  id: string;
  workoutName: string;
}

export interface TrainerProfileInterface extends UserProfile{}


export interface TrainerProfile {
  userId: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
}

export interface TrainerProfileDataInterface {
  userId: string;
  experienceInYears: number;
  certifications: string[];
  bio: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
}

export interface PopulatedTrainerProfile extends Omit<ITrainerProfileDocument, 'userId'> {
  userId: IUserDocument;
}

export interface ITrainerWithProfile {
  user: IUserDocument;
  profile: ITrainerProfileDocument;
}