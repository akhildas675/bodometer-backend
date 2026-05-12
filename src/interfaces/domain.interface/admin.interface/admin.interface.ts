import { FeatureType } from "@/constants/subscription.constant";
import { Role, ROLES } from "../../../constants/roles";
import { PaginationMeta } from "../common.interface";
export { PaginationMeta, PaginatedResult } from "../common.interface";

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


export interface Category {
  categoryId?: string;
  name: string;
  description: string;
  media: {
    image: {
      url: string;
    };
  };
  isActive?: boolean;
}

export interface CategoryQuery {
  search?: string;
  limit?: number;
  page?: number;
  isActive?: boolean;
}

export interface GetAllCategoriesResponse {
  data: Category[];
  pagination: PaginationMeta;
}

export interface SubscriptionFeature {
  subscriptionFeatureId?: string;
  key: string;
  title: string;
  description: string;
  type: FeatureType;
  isActive?: boolean;
}

export interface SubscriptionFeatureQuery {
  search?: string;
  limit?: number;
  page?: number;
  isActive?: boolean;
}


export interface SubscriptionPlan {
  subscriptionPlanId?: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  features: {
    featureId: string;
    limit?: number;
    limitType?: string;
  }[];
  isPopular: boolean;

  isActive?: boolean;
}

export interface SubscriptionPlanQuery {
  search?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetAllSubscriptionPlansResponse {
  data: SubscriptionPlan[];
  pagination: PaginationMeta;
}

