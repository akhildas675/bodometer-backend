import { Booking } from "../domain/booking.interface";
import { BookingCancellation } from "../domain/booking-cancellation.interface";
import { BookingRefund } from "../domain/booking-refund.interface";

export interface CancelBookingByUserParams {
  bookingId: string;
  userId: string;
  reason?: string;
  reasonCode?: string;
}

export interface CancelBookingByTrainerParams {
  bookingId: string;
  trainerId: string;
  reason: string;
  reasonCode?: string;
}

export interface CancelBookingResult {
  booking: Booking;
  cancellation: BookingCancellation;
  refund?: BookingRefund;
}

export interface IBookingCancellationService {
  cancelByUser(params: CancelBookingByUserParams): Promise<CancelBookingResult>;
  cancelByTrainer(params: CancelBookingByTrainerParams): Promise<CancelBookingResult>;
}
