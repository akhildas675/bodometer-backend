import { ISubscriptionTransaction } from "../../models/subscription-transaction.model";
import { CreateSubscriptionTransactionData, SubscriptionTransactionPaginatedResult, SubscriptionTransactionQuery } from "../subscription.interface";


export interface ISubscriptionTransactionRepository {
  create(
    data: CreateSubscriptionTransactionData,
  ): Promise<ISubscriptionTransaction>;

  findByTransactionId(
    transactionId: string,
  ): Promise<ISubscriptionTransaction | null>;

  findAllPaginated(
    query: SubscriptionTransactionQuery,
  ): Promise<SubscriptionTransactionPaginatedResult>;

  findByUserId(
    userId: string,
  ): Promise<ISubscriptionTransaction[]>;

  findUserTransactionsPaginated(
    userId: string,
    query: SubscriptionTransactionQuery,
  ): Promise<SubscriptionTransactionPaginatedResult>;
}