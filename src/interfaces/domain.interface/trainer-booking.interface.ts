import { BookingStatus } from "../../models/trainer-booking.model";

export interface TimeWindow {
  startTime: string;
  endTime: string;
}

export interface TrainerAvailability {
  _id: string;
  trainerId: string;
  startDate: Date;
  endDate: Date;
  timeWindows: TimeWindow[];
  sessionDuration: number;
  isActive: boolean;
}

import { IUserDocument } from "../../models/user.model";

export interface TrainerBooking {
  _id: string;
  userId: string;
  trainerId: string;
  bookingReference: string;
  bookingType: "ONLINE" | "OFFLINE";
  bookingDate: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  userNotes: string;
  rejectionReason?: string;
  cancellationReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  statusUpdatedAt?: Date;
  createdAt: Date;
}

export interface PopulatedTrainerBooking extends Omit<TrainerBooking, "userId" | "trainerId"> {
  userId: IUserDocument;
  trainerId: IUserDocument;
}
