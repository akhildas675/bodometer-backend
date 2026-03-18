import { PaymentStatus } from "@/models/subscription-transaction.model";

export interface SubscriptionTransaction {
  id: string;
  userId: string;
  planId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  isRenewal: boolean;
  purchasedAt: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
}
