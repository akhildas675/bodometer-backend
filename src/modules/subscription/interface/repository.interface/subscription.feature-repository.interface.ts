import {
  SubscriptionFeature,
  SubscriptionFeatureQuery,
} from "@/modules/subscription/interface/subscription.interface";
import { PaginatedResult } from '@/modules/base/interface/common.interface';

export interface ISubscriptionFeatureRepository {
  getAllSubscriptionFeatures(
    query: SubscriptionFeatureQuery,
  ): Promise<PaginatedResult<SubscriptionFeature>>;
  createSubscriptionFeature(
    featureData: SubscriptionFeature,
  ): Promise<SubscriptionFeature>;
  getSubscriptionFeatureById(id: string): Promise<SubscriptionFeature | null>;
  updateSubscriptionFeature(
    id: string,
    featureData: Partial<SubscriptionFeature>,
  ): Promise<SubscriptionFeature | null>;
  toggleSubscriptionFeatureStatus(
    id: string,
  ): Promise<SubscriptionFeature | null>;
}
