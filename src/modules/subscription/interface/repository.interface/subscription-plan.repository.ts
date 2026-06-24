import {
  GetAllSubscriptionPlansResponse,
  SubscriptionPlan,
  SubscriptionPlanQuery,
} from "@/modules/subscription/interface/subscription.interface";

export interface ISubscriptionPlanRepository {
  createSubscriptionPlan(data: SubscriptionPlan): Promise<SubscriptionPlan>;
  getSubscriptionPlans(
    query: SubscriptionPlanQuery,
  ): Promise<GetAllSubscriptionPlansResponse>;
  getSubscriptionPlanById(
    subscriptionPlanId: string,
  ): Promise<SubscriptionPlan | null>;
  updateSubscriptionPlan(
    subscriptionPlanId: string,
    data: Partial<SubscriptionPlan>,
  ): Promise<SubscriptionPlan | null>;
  toggleSubscriptionPlanStatus(
    subscriptionPlanId: string,
  ): Promise<SubscriptionPlan | null>;
  getActiveSubscriptionPlans(): Promise<SubscriptionPlan[] | null>;
}
