export type UnavailabilityType =
  | "VACATION"
  | "MEDICAL_LEAVE"
  | "EMERGENCY"
  | "PERSONAL_LEAVE";

export type UnavailabilityStatus =
  | "ACTIVE"
  | "CANCELLED";

export interface TrainerUnavailability {
  id?: string;

  trainerId: string;

  type: UnavailabilityType;

  startDate: Date;
  endDate: Date;

  reason?: string;

  status: UnavailabilityStatus;

  createdAt?: Date;
  updatedAt?: Date;
}