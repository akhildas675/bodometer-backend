import { VerificationStatus } from "../../constants/verification.constants";

export interface TrainerWorkoutList{
    id:string;
    workoutName:string;
}

export interface TrainerProfile {
  userId: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
}

