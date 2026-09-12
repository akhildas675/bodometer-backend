export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "RESCHEDULE_PENDING"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW"
  | "EXPIRED";

export type AttendanceStatus = "PENDING" | "ATTENDED" | "MISSED";

export interface BookingAttendance {
  status: AttendanceStatus;
  markedAt?: Date;
  markedBy?: string;
}

export interface BookingServiceSnapshot {
  name: string;
  durationMinutes: number;
  bookingMode?: string;
}

export interface BookingPricingSnapshot {
  baseAmount: number;
  discountAmount: number;
  serviceFee: number;
  totalAmount: number;
  currency: string;
}

export interface BookingCancellationSummary {
  cancelledBy?: string;
  reason?: string;
  cancelledAt?: Date;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  trainerId: string;
  userId: string;
  availabilityId?: string;
  serviceId: string;
  serviceSnapshot?: BookingServiceSnapshot;
  pricing?: BookingPricingSnapshot;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  bufferEndTime: Date;
  status: BookingStatus;
  paymentId?: string;
  price: number;
  attendance: BookingAttendance;
  cancellation?: BookingCancellationSummary;
  userName?: string;
  userEmail?: string;
  trainerName?: string;
  trainerEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
