import { ISubscriptionTransaction } from "@/models/subscription-transaction.model";
import {
  PaymentGateway,
  TransactionStatus,
} from "@/constants/subscription.constant";

export interface ISubscriptionTransactionRepository {
  create(data: {
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
  }): Promise<ISubscriptionTransaction>;

  findByTransactionId(
    transactionId: string,
  ): Promise<ISubscriptionTransaction | null>;
}
