import { PopulatedSubscriptionTransaction } from "../mapper/subscription.mapper";
import { FeatureType, PaymentGateway, TransactionStatus } from "../constants/subscription.constant";
import { PaginationMeta } from "../../../interfaces/domain.interface/common.interface";

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
  featuresCount?: number;
  isPopular: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPlanQuery {
  search?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive:boolean,
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
export interface CreateSubscriptionTransactionData {
  userId: string;
  subscriptionPlanId: string;
  userSubscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentGateway: PaymentGateway;
  transactionId: string;
  paymentStatus: TransactionStatus;
  paidAt: Date;
  meta?: Record<string, unknown>;
}

export interface SubscriptionTransactionQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  status?: string;
}

export interface SubscriptionTransactionDetails {
  id: string;
  userId: string;
  userName: string;
  subscriptionPlanId: string;
  subscriptionPlanName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentGateway: PaymentGateway;
  transactionId: string;
  paymentStatus: TransactionStatus;
  paidAt: Date;
  createdAt: Date;
}

export interface SubscriptionTransactionPaginatedResult {
  data: PopulatedSubscriptionTransaction[];
  pagination: PaginationMeta;
}