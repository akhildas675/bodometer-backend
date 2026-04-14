import { SubscriptionTransaction } from "./subscription.interface";

export interface ISubscriptionTransactionRepository {
  createTransaction(data: Omit<SubscriptionTransaction, "id" | "createdAt">): Promise<SubscriptionTransaction>;
  findActiveByUserId(userId: string): Promise<SubscriptionTransaction | null>;
  updateByGatewayOrderId(gatewayOrderId: string, data: Partial<SubscriptionTransaction>): Promise<SubscriptionTransaction | null>;
  findLatestByUserId(userId: string): Promise<SubscriptionTransaction | null>;
}