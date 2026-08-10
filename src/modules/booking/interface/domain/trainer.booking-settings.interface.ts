import {
  AdvanceNoticeHours,
  BufferTimeMinutes,
  MaxBookingLimits,
} from "@/constants/constant.values.ts/booking.constant";

export interface TrainerBookingSettings {
  id?: string;

  trainerId: string;

  serviceIds: string[];

  advanceNoticeHours: AdvanceNoticeHours;

  bufferMinutes: BufferTimeMinutes;

  maximumBookingPerDay: MaxBookingLimits;

  createdAt?: Date;
  updatedAt?: Date;
}