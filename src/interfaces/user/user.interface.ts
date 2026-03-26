import { Gender } from "@/constants/identity.constants";
import { Role } from "@/constants/roles";

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
  gender: Gender | null; 
  role: Role;
  isVerified: boolean;
  dateOfBirth: Date | null;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutDetailResponse {
  workout: {
    id: string;
    workoutName: string;
    workoutDescription: string;
    workoutImage: string;
    coverPhoto: string;       
    introVideo: string;       
    targetMuscles: string[];  
    equipment: string[];      
    benefits: string[];       
    isActive: boolean;
    createdAt: string;
  };
  relatedTrainers: {
    _id: string;
    name: string;
    profilePic: string | null;
    experienceInYears: number;
    bio: string;
  }[];
  relatedWorkouts: {
    id: string;
    workoutName: string;
    workoutDescription: string;
    workoutImage: string;
  }[];
}