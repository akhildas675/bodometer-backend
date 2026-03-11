import { Subscription } from "@/interfaces/admin/admin.interface";
import { BaseRepository } from "../base/base.repository";
import { ISubscriptionDocument, SubscriptionModel } from "@/models/subscription.model";
import { ISubscriptionRepository } from "@/interfaces/admin/subscription/subscription-repository.interface";

export default class SubscriptionRepository
  extends BaseRepository<Subscription, ISubscriptionDocument>
  implements ISubscriptionRepository
{
  constructor() {
    super(SubscriptionModel);
  }

  protected toInterface(doc: ISubscriptionDocument): Subscription {
    return {
      id: doc._id.toString(),
      subscriptionName: doc.subscriptionName,
      description: doc.description,
      price: doc.price,
      durationDays: doc.durationDays,
      features: doc.features,
      liveSessionCount: doc.liveSessionCount,
      planType: doc.planType,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
    };
  }

  async createSubscription(body: Subscription): Promise<Subscription> {
    return this.create(body);
  }

  async findAllSubscriptions(): Promise<Subscription[]> {
    return this.findAll({});
  }

  async findSubscriptionById(id: string): Promise<Subscription | null> {
    return this.findById(id);
  }

  async updateSubscription(
    id: string,
    data: Partial<Subscription>
  ): Promise<Subscription | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    return doc ? this.toInterface(doc) : null;
  }

  async setSubscriptionStatus(
    id: string,
    isActive: boolean
  ): Promise<Subscription | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: { isActive } }, { new: true })
      .exec();
    return doc ? this.toInterface(doc) : null;
  }
}