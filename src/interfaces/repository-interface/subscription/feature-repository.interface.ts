import { PaginatedResult, SubscriptionFeature, SubscriptionFeatureQuery } from "@/interfaces/domain.interface/admin.interface/admin.interface";


export interface ISubscriptionFeatureRepository {
  getAllSubscriptionFeatures(query: SubscriptionFeatureQuery): Promise<PaginatedResult<SubscriptionFeature>>
  createSubscriptionFeature(featureData: SubscriptionFeature): Promise<SubscriptionFeature>
  getSubscriptionFeatureById(id: string): Promise<SubscriptionFeature | null>
  updateSubscriptionFeature(id: string, featureData: Partial<SubscriptionFeature>): Promise<SubscriptionFeature | null>
  toggleSubscriptionFeatureStatus(id: string): Promise<SubscriptionFeature | null>
}