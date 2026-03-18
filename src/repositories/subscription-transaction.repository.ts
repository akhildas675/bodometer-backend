import mongoose from "mongoose";
import { ISubscriptionTransactionDocument, SubscriptionTransactionModel } from "@/models/subscription-transaction.model";
import { BaseRepository } from "./base/base.repository";
import { SubscriptionTransaction } from "@/interfaces/subscription/subscription.interface";
import { ISubscriptionTransactionRepository } from "@/interfaces/subscription/subscription.transaction-repository.interface";

export default class SubscriptionTransactionRepository
  extends BaseRepository<SubscriptionTransaction, ISubscriptionTransactionDocument>
  implements ISubscriptionTransactionRepository
{
  constructor() {
    super(SubscriptionTransactionModel);
  }

  protected toInterface(doc: ISubscriptionTransactionDocument): SubscriptionTransaction {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      planId: doc.planId.toString(),
      gatewayOrderId: doc.gatewayOrderId,
      gatewayPaymentId: doc.gatewayPaymentId ?? null,
      amount: doc.amount,
      currency: doc.currency,
      paymentMethod: doc.paymentMethod,
      paymentStatus: doc.paymentStatus,
      isRenewal: doc.isRenewal,
      purchasedAt: doc.purchasedAt ?? null,
      startDate: doc.startDate ?? null,
      endDate: doc.endDate ?? null,
      createdAt: doc.createdAt,
    };
  }

  async createTransaction(
    data: Omit<SubscriptionTransaction, "id" | "createdAt">,
  ): Promise<SubscriptionTransaction> {
    return this.create(data);
  }

  async findActiveByUserId(userId: string): Promise<SubscriptionTransaction | null> {
    const doc = await SubscriptionTransactionModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      paymentStatus: "completed",
      endDate: { $gte: new Date() },
    })
      .sort({ createdAt: -1 })
      .lean<ISubscriptionTransactionDocument>();
    return doc ? this.toInterface(doc) : null;
  }

  async updateByGatewayOrderId(
    gatewayOrderId: string,
    data: Partial<SubscriptionTransaction>,
  ): Promise<SubscriptionTransaction | null> {
    const doc = await SubscriptionTransactionModel.findOneAndUpdate(
      { gatewayOrderId },
      { $set: data },
      { new: true },
    ).lean<ISubscriptionTransactionDocument>();
    return doc ? this.toInterface(doc) : null;
  }
}