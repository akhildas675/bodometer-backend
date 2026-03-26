import { Gender } from "@/constants/identity.constants";
import { PlanType } from "@/constants/subscription";

export interface FindUserDto {
  userId: string;
}

export interface FindUserResponseDto {
  id: string;
  name: string;
  email: string;
  userName: string;
  phoneNumber: string;
  gender: string | null;
  profilePic: string | null;
  dateOfBirth: string | null;
}

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



export interface GetUserWorkoutsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserWorkoutResponseDto {
  id: string;
  workoutName: string;
  workoutDescription: string;
  workoutImage: string;
}

export interface RelatedTrainerDto {
  _id: string;
  name: string;
  profilePic: string | null;
  experienceInYears: number;
  bio: string;
}
export interface GetSubscriptionsResponseDto {
  id: string;
  subscriptionName: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  liveSessionCount: number;
  planType: PlanType;
}

export interface ActiveSubscriptionDto {
  planId: string;
  subscriptionName: string;
  planType: PlanType;
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

export interface CreateCheckoutSessionDto {
  planId: string;
}

export interface CheckoutSessionResponseDto {
  sessionId: string;
  url: string;
}

export interface GetTrainersQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  specializationId?: string;
}

export interface TrainerListItemDto {
  _id: string;
  name: string;
  profilePic: string | null;
  profileId: string; 
  experienceInYears: number;
  coverPhoto:string;
  bio: string;
  specializations: { _id: string; workoutName: string }[];
}

export interface TrainerListResponseDto {
  data: TrainerListItemDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface WorkoutDetailResponseDto {
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
}

export interface RelatedTrainerDto {
  _id: string;
  name: string;
  profilePic: string | null;
  experienceInYears: number;
  bio: string;
}

export interface WorkoutDetailPageDto {
  workout: WorkoutDetailResponseDto;
  relatedTrainers: RelatedTrainerDto[];
  relatedWorkouts: WorkoutDetailResponseDto[];
}


export interface TrainerDetailDto {
  _id: string;
  name: string;
  profilePic: string | null;
  coverPhoto: string;
  bio: string;
  experienceInYears: number;
  specializations: { _id: string; workoutName: string }[];
}
 