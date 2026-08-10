import { BookingRefund } from "../domain/booking-refund.interface";

export interface CreateRefundParams {
  bookingId: string;
  paymentId?: string;
  userId: string;
  trainerId: string;
  amount: number;
  currency?: string;
  reason: string;
  triggeredBy: "USER" | "TRAINER" | "ADMIN" | "SYSTEM";
}

export interface IBookingRefundService {
  createRefundRecord(params: CreateRefundParams): Promise<BookingRefund>;
  processRefund(refundId: string): Promise<BookingRefund>;
  getRefundByBookingId(bookingId: string): Promise<BookingRefund | null>;
}
