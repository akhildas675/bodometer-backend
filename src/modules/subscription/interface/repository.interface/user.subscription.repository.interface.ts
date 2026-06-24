import { IUserSubscription } from "../../models/user-subscription.model";

export interface IUserSubscriptionRepository {
  create(data: {
    userId: string;
    subscriptionPlanId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<IUserSubscription>;

  findActiveByUserId(userId: string): Promise<IUserSubscription | null>;
}
