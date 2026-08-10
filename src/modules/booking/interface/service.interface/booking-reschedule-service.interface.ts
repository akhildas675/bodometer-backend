import { Booking } from "../domain/booking.interface";
import { BookingRescheduleRequest } from "../domain/booking-reschedule-request.interface";

export interface TrainerProposeRescheduleParams {
  bookingId: string;
  trainerId: string;
  proposedStartTime: string;
  proposedEndTime: string;
  proposedBufferEndTime: string;
  reason: string;
}

export interface RespondRescheduleParams {
  requestId: string;
  userId: string;
  accept: boolean;
  reason?: string;
}

export interface WithdrawRescheduleParams {
  requestId: string;
  trainerId: string;
  reason?: string;
}

export interface RespondRescheduleResult {
  request: BookingRescheduleRequest;
  booking: Booking;
}

export interface IBookingRescheduleService {
  proposeByTrainer(params: TrainerProposeRescheduleParams): Promise<BookingRescheduleRequest>;
  respondToProposal(params: RespondRescheduleParams): Promise<RespondRescheduleResult>;
  withdrawProposal(params: WithdrawRescheduleParams): Promise<BookingRescheduleRequest>;
  getPendingRequestsForUser(userId: string): Promise<{ request: BookingRescheduleRequest; booking: Booking }[]>;
}
