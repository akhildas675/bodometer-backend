import {
  SubscriptionTransactionModel,
  ISubscriptionTransaction,
} from "@/models/subscription-transaction.model";
import {
  PaymentGateway,
  TransactionStatus,
} from "@/constants/subscription.constant";
import { ISubscriptionTransactionRepository } from "@/interfaces/repository-interface/subscription/subscription.transaction-repository.interface";

export class SubscriptionTransactionRepository implements ISubscriptionTransactionRepository {
  async create(data: {
    userId: string;
    subscriptionPlanId: string;
    userSubscriptionId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentGateway: PaymentGateway;
    transactionId: string;
    paymentStatus: TransactionStatus;
    paidAt: Date;
    meta?: Record<string, unknown>;
  }): Promise<ISubscriptionTransaction> {
    return SubscriptionTransactionModel.create(data);
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<ISubscriptionTransaction | null> {
    return SubscriptionTransactionModel.findOne({
      transactionId,
    }).lean() as Promise<ISubscriptionTransaction | null>;
  }
}
