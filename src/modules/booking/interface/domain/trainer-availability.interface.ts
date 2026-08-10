import {
  AvailabilityStatus,
  DayOfWeek,
} from "@/constants/constant.values.ts/booking.constant";

export interface TrainerShift {
  startMinute: number;
  endMinute: number;
}

export interface TrainerWeeklySchedule {
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  shifts: TrainerShift[];
}

export interface TrainerAvailability {
  id?: string;
  trainerId: string;

  effectiveFrom: Date;
  effectiveUntil: Date;

  timeZone: string;

  weeklySchedule: TrainerWeeklySchedule[];

  status: AvailabilityStatus;

  createdAt?: Date;
  updatedAt?: Date;
}