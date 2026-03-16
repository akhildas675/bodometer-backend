import { Subscription } from "../admin/admin.interface";

export interface ISubscriptionRepository {
  createSubscription(body: Subscription): Promise<Subscription>;
  findAllSubscriptions(): Promise<Subscription[]>;
  findSubscriptionById(id: string): Promise<Subscription | null>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | null>;
  setSubscriptionStatus(id: string, isActive: boolean): Promise<Subscription | null>;
}