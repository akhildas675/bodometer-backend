import { BookingStatus } from "../../models/trainer-booking.model";
import { PaginationQueryDto } from "../common.dto";
import { BaseUserDto } from "../common.dto";

export interface TimeWindowDto {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface CreateAvailabilityDto {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  timeWindows: TimeWindowDto[];
  sessionDuration: number; // 30, 45, 60, 90, 120
}

export interface UpdateAvailabilityDto {
  isActive: boolean;
}

export interface GetAvailabilitiesQueryDto extends PaginationQueryDto {
  status?: string; // active, inactive
}

export interface GetSlotsQueryDto {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  trainerId?: string;
}

export interface DynamicSlotDto {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface CreateBookingDto {
  trainerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  userNotes?: string;
  bookingType?: "ONLINE" | "OFFLINE";
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
  rejectionReason?: string;
}

export interface BookingListItemDto {
  _id: string;
  userId: BaseUserDto & { _id: string };
  trainerId: BaseUserDto & { _id: string };
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

export interface GetBookingsQueryDto extends PaginationQueryDto {
  status?: BookingStatus;
  date?: string; // YYYY-MM-DD
}
