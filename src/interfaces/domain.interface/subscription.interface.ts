import { FeatureType } from "../../constants/subscription.constant";
import { PaginationMeta } from "./common.interface";

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

export interface UserSubscriptions {
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
