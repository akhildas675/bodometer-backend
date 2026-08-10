export type RescheduleRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type RescheduleActor = "USER" | "TRAINER";

export interface BookingRescheduleRequest {
  id: string;
  bookingId: string;
  requestedBy: RescheduleActor;
  requestedByUserId: string;
  oldStartTime: Date;
  oldEndTime: Date;
  proposedStartTime: Date;
  proposedEndTime: Date;
  proposedBufferEndTime: Date;
  reason: string;
  status: RescheduleRequestStatus;
  expiresAt: Date;
  respondedAt?: Date;
  responseReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
