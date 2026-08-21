import { Role } from "@/constants/constant.values.ts/roles";
import {
  CreateSubscriptionFeatureDto,
  GetAllSubscriptionFeaturesResponseDto,
  SubscriptionFeatureDto,
  SubscriptionFeatureQueryDto,
  ToggleSubscriptionFeatureStatusResponseDto,
  UpdateSubscriptionFeatureDto,
  ActiveSubscriptionDto,
  CreateSubscriptionPlanDto,
  GetAllSubscriptionPlansResponseDto,
  GetAllSubscriptionTransactionsResponseDto,
  GetSubscriptionPlanByIdResponseDto,
  SubscriptionPlanQueryDto,
  SubscriptionTransactionQueryDto,
  ToggleSubscriptionPlanStatusResponseDto,
  UpdateSubscriptionPlanDto,
} from "../dto/subscription.dto";
import { UpgradePreviewDto } from "../interface/subscription.interface";

export interface ISubscriptionService {
  // Features
  getAllSubscriptionFeatures(
    query: SubscriptionFeatureQueryDto,
  ): Promise<GetAllSubscriptionFeaturesResponseDto>;
  createSubscriptionFeature(
    data: CreateSubscriptionFeatureDto,
  ): Promise<void>;
  updateSubscriptionFeature(
    data: UpdateSubscriptionFeatureDto,
    subscriptionFeatureId: string,
  ): Promise<void>;
  toggleSubscriptionFeatureStatus(
    subscriptionFeatureId: string,
  ): Promise<ToggleSubscriptionFeatureStatusResponseDto>;
  getSubscriptionFeatureById(
    subscriptionFeatureId: string,
  ): Promise<SubscriptionFeatureDto>;

  // Plans
  createSubscriptionPlan(data: CreateSubscriptionPlanDto): Promise<void>;
  getSubscriptionPlans(
    query: SubscriptionPlanQueryDto,
    role: Role,
  ): Promise<GetAllSubscriptionPlansResponseDto>;
  getSubscriptionPlanById(
    subscriptionPlanId: string,
  ): Promise<GetSubscriptionPlanByIdResponseDto>;
  updateSubscriptionPlan(
    data: UpdateSubscriptionPlanDto,
    subscriptionPlanId: string,
  ): Promise<void>;
  toggleSubscriptionPlanStatus(
    subscriptionPlanId: string,
  ): Promise<ToggleSubscriptionPlanStatusResponseDto>;
  getAllSubscriptionTransactions(
    query: SubscriptionTransactionQueryDto,
  ): Promise<GetAllSubscriptionTransactionsResponseDto>;
  createCheckoutSession(
    userId: string,
    subscriptionPlanId: string,
  ): Promise<{ checkoutUrl: string }>;
  verifyPaymentAndSave(
    userId: string,
    sessionId: string,
  ): Promise<ActiveSubscriptionDto>;
  getActiveSubscription(userId: string): Promise<ActiveSubscriptionDto | null>;
  getUserTransactions(
    userId: string,
    query: SubscriptionTransactionQueryDto,
  ): Promise<GetAllSubscriptionTransactionsResponseDto>;
  getUpgradePreview(
    userId: string,
    targetPlanId: string,
  ): Promise<UpgradePreviewDto>;
  createUpgradeCheckoutSession(
    userId: string,
    targetPlanId: string,
  ): Promise<{ checkoutUrl: string | null; directSuccess?: boolean }>;
}
