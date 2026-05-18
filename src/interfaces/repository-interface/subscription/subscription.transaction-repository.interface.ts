import { ISubscriptionTransaction } from "@/models/subscription-transaction.model";
import {
  PaymentGateway,
  TransactionStatus,
} from "@/constants/subscription.constant";
import { PaginationMeta } from "../../domain.interface/common.interface";

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

  findAllPaginated(
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    page?: number,
    limit?: number,
    status?: string,
  ): Promise<{ data: any[]; pagination: PaginationMeta }>;

  findByUserId(
    userId: string,
  ): Promise<ISubscriptionTransaction[]>;

  findUserTransactionsPaginated(
    userId: string,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    page?: number,
    limit?: number,
    status?: string,
  ): Promise<{ data: any[]; pagination: PaginationMeta }>;
}
