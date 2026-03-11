import { ROLES, type Role } from "@/constants/roles";
import { PlanType } from "@/constants/subscription";

export interface AdminAccountInterface<R extends Role> {
  id: string;
  name: string;
  email: string;
  role: R;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
}

export type AdminUserInterface = AdminAccountInterface<typeof ROLES.USER>;
export type AdminTrainerInterface = AdminAccountInterface<typeof ROLES.TRAINER>;

export interface AdminUserActionDto {
  userId: string;
}

export interface Workout {
  id?: string;
  workoutName: string;
  workoutDescription: string;
  workoutImage: string;
  isActive: boolean;
}


export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

//subscription


export interface Subscription {
  id?:string,
  subscriptionName: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  liveSessionCount: number;
  planType: PlanType
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}