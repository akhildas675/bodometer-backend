export type RefundStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface BookingRefund {
  id: string;
  bookingId: string;
  paymentId?: string;
  userId: string;
  trainerId: string;
  amount: number;
  currency: string;
  reason: string;
  triggeredBy: "USER" | "TRAINER" | "ADMIN" | "SYSTEM";
  status: RefundStatus;
  gatewayRefundId?: string;
  failureReason?: string;
  processedBy?: string;
  createdAt?: Date;
  processedAt?: Date;
  updatedAt?: Date;
}
