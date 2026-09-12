import { Booking } from "../domain/booking.interface";

export interface CreateBookingInput {
  userId: string;
  trainerId: string;
  serviceId: string;
  bookingDate: string; // ISO date string
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  bufferEndTime: string; // ISO timestamp
  paymentMethod?: "WALLET" | "ONLINE" | "SPLIT";
}

export interface CreateBookingResponse {
  booking: Booking;
  checkoutUrl?: string;
  sessionId?: string;
}

export interface VerifyPaymentInput {
  bookingId: string;
  sessionId: string;
}

export interface IBookingService {
  createBooking(input: CreateBookingInput): Promise<CreateBookingResponse>;
  verifyBookingPayment(input: VerifyPaymentInput): Promise<Booking>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getTrainerBookings(trainerId: string): Promise<Booking[]>;
  getBookingById(bookingId: string): Promise<Booking | null>;
  cancelBooking(bookingId: string, userId: string, reason?: string): Promise<Booking>;
}
