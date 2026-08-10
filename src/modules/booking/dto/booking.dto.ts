export interface CreateBookingDto {
  trainerId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bufferEndTime: string;
  paymentMethod?: "WALLET" | "ONLINE" | "SPLIT";
}

export interface VerifyPaymentDto {
  bookingId: string;
  sessionId: string;
}

export interface CancelBookingDto {
  reason?: string;
  reasonCode?: string;
}

export interface ProposeRescheduleDto {
  proposedStartTime: string;
  proposedEndTime: string;
  proposedBufferEndTime: string;
  reason?: string;
}

export interface RespondRescheduleDto {
  accept: boolean;
  reason?: string;
}

export interface WithdrawRescheduleDto {
  reason?: string;
}
