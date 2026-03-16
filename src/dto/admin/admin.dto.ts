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


//trainer

export interface AdminGetTrainersDto {
  page?: number;
  limit?: number;
  search?: string;
  isBlocked?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminGetTrainersResponseDto
  extends AdminBaseUserResponseDto {}

export interface AdminBlockUnblockTrainerDto {
  trainerId: string;
}
export interface ApproveTrainerResponseDto {
  profileId: string;
  status: string;
}

export interface RejectTrainerBodyDto {
  reason: string;
}

export interface GetTrainerAppointmentsQueryDto {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  status?: string;
}


//user


export interface AdminGetUsersDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: Exclude<Role, "admin">;
  isBlocked?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminGetUsersResponseDto
  extends AdminBaseUserResponseDto {}

export interface AdminBlockUnBlockUserDto {
  userId: string;
}
