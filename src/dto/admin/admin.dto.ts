import { Role } from "@/constants/roles";
import { PlanType } from "@/constants/subscription";

export interface PaginationMetaDto {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationMetaDto;
}

export interface AdminBaseUserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, "admin">;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
  profilePic?: string | null;
}
export interface AddWorkoutDto {
  workoutName: string;
  workoutDescription: string;
  file: Express.Multer.File;
}
export interface AddWorkoutResponseDto {
  id: string;
  workoutName: string;
  workoutDescription: string;
  workoutImage: string;
}
export interface GetWorkoutsResponseDto {
  id: string;
  workoutName: string;
  workoutDescription: string;
  workoutImage: string;
  isActive: boolean;
}


//subscription

export interface CreateSubscriptionDTO {
  subscriptionName: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  liveSessionCount: number;
  planType:PlanType,
}

export interface SubscriptionResponseDTO {
  id: string;
  subscriptionName: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  liveSessionCount: number;
  planType: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UpdateSubscriptionDTO {
  subscriptionName?: string;
  description?: string;
  price?: number;
  durationDays?: number;
  features?: string[];
  liveSessionCount?: number;
  planType?: PlanType;
}