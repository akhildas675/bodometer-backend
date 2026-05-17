import { SubscriptionFeature, SubscriptionFeatureQuery } from "@/interfaces/domain.interface/subscription.interface";
import { PaginatedResult } from "@/interfaces/domain.interface/common.interface";


export interface ISubscriptionFeatureRepository {
  getAllSubscriptionFeatures(query: SubscriptionFeatureQuery): Promise<PaginatedResult<SubscriptionFeature>>
  createSubscriptionFeature(featureData: SubscriptionFeature): Promise<SubscriptionFeature>
  getSubscriptionFeatureById(id: string): Promise<SubscriptionFeature | null>
  updateSubscriptionFeature(id: string, featureData: Partial<SubscriptionFeature>): Promise<SubscriptionFeature | null>
  toggleSubscriptionFeatureStatus(id: string): Promise<SubscriptionFeature | null>
}