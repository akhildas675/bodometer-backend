import { IUserSubscriptionRepository } from "@/interfaces/repository-interface/subscription/user.subscription.repository.interface";
import { UserSubscriptionModel, IUserSubscription } from "@/models/user-subscription.model";


export class UserSubscriptionRepository implements IUserSubscriptionRepository {

  async create(data: {
    userId: string;
    subscriptionPlanId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<IUserSubscription> {
    return UserSubscriptionModel.create(data);
  }

  async findActiveByUserId(userId: string): Promise<IUserSubscription | null> {
    return UserSubscriptionModel.findOne({
      userId,
      status: "active",
      endDate: { $gte: new Date() },
    })
      .populate("subscriptionPlanId", "name description price durationInDays")
      .lean() as Promise<IUserSubscription | null>;
  }
}