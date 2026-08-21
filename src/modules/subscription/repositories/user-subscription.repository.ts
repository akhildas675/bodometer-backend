import { IUserSubscriptionRepository } from "@/modules/subscription/interface/repository.interface/user.subscription.repository.interface";
import {
  UserSubscriptionModel,
  IUserSubscription,
} from "../models/user-subscription.model";
import mongoose from "mongoose";
import { injectable } from "inversify";

@injectable()
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
      userId: new mongoose.Types.ObjectId(userId),
      status: "active",
      endDate: { $gte: new Date() },
    })
      .populate("subscriptionPlanId", "name description price durationInDays")
      .lean() as Promise<IUserSubscription | null>;
  }

  async update(
    id: string,
    updateData: Partial<{
      subscriptionPlanId: string;
      startDate: Date;
      endDate: Date;
      status: string;
      autoRenew: boolean;
    }>,
  ): Promise<IUserSubscription | null> {
    return UserSubscriptionModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean() as Promise<IUserSubscription | null>;
  }
}
