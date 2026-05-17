import { FeatureType } from "../../constants/subscription.constant";
import { PaginationMetaDto, PaginationQueryDto } from "../common.dto";

export interface CreateCheckoutSessionDto {
  planId: string;
}

export interface CheckoutSessionResponseDto {
  sessionId: string;
  url: string;
}

export interface UserSubscriptionPlanResponseDto {
  subscriptionPlanId?: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  features: {
    featureId: string;
    title?: string;
    limit?: number;
    limitType?: string;
  }[];
  isPopular: boolean;
  isActive?: boolean;
}

export interface ActiveSubscriptionDto {
  subscriptionId: string;
  planId: string;
  planName: string;
  startDate: Date;
  endDate: Date;
  status: string;
  daysRemaining: number;
}

export interface SubscriptionFeatureQueryDto extends PaginationQueryDto {
  search?: string;
}

export interface SubscriptionFeatureDto {
  subscriptionFeatureId: string;
  key: string;
  title: string;
  description: string;
  type: FeatureType;
  isActive: boolean;
}

export interface GetAllSubscriptionFeaturesResponseDto {
  data: SubscriptionFeatureDto[];
  pagination: PaginationMetaDto;
}

export interface CreateSubscriptionFeatureDto {
  title: string;
  description: string;
  type: FeatureType;
}

export interface UpdateSubscriptionFeatureDto {
  subscriptionFeatureId: string;
  title?: string;
  description?: string;
  type?: FeatureType;
}

export interface ToggleSubscriptionFeatureStatusResponseDto {
  message: string;
  feature: SubscriptionFeatureDto;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  isPopular?: boolean;
  features: Array<{ featureId: string; limit?: number; limitType?: string }>;
}

export interface SubscriptionPlanQueryDto extends PaginationQueryDto {
  search?: string;
}

export interface SubscriptionPlanDto {
  subscriptionPlanId: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  isPopular: boolean;
  isActive: boolean;
  features: Array<{ featureId: string; limit?: number; limitType?: string }>;
}

export interface GetAllSubscriptionPlansResponseDto {
  data: SubscriptionPlanDto[];
  pagination: PaginationMetaDto;
}

export interface ToggleSubscriptionPlanStatusResponseDto {
  message: string;
  plan: SubscriptionPlanDto;
}

export interface GetSubscriptionPlanByIdResponseDto {
  subscriptionPlanId: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  isPopular: boolean;
  isActive: boolean;
  features: Array<{ featureId: string; limit?: number; limitType?: string }>;
}

export interface UpdateSubscriptionPlanDto {
  subscriptionPlanId: string;
  name?: string;
  description?: string;
  price?: number;
  durationInDays?: number;
  isPopular?: boolean;
  isActive?: boolean;
  features?: Array<{ featureId: string; limit?: number; limitType?: string }>;
}
