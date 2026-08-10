import {
  AvailabilityStatus,
  DayOfWeek,
  AdvanceNoticeHours,
  BufferTimeMinutes,
  MaxBookingLimits,
} from "@/constants/constant.values.ts/booking.constant";


export interface ShiftDto {
  startMinute: number;
  endMinute: number;
}

export interface WeeklyScheduleDto {
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  shifts: ShiftDto[];
}

export interface SetupAvailabilityDto {
  effectiveFrom: Date;
  effectiveUntil: Date;
  timeZone: string;
  weeklySchedule: WeeklyScheduleDto[];
  status: AvailabilityStatus;
}

export interface SetupBookingSettingsDto {
  serviceIds: string[];
  advanceNoticeHours: AdvanceNoticeHours;
  bufferMinutes: BufferTimeMinutes;
  maximumBookingPerDay: MaxBookingLimits;
}

export type UnavailabilityType =
  | "VACATION"
  | "MEDICAL_LEAVE"
  | "EMERGENCY"
  | "PERSONAL_LEAVE";

export interface SetupUnavailabilityDto {
  type: UnavailabilityType;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface CreateTrainerSchedulingSetupDto {
  availability: SetupAvailabilityDto;
  settings: SetupBookingSettingsDto;
  unavailabilities?: SetupUnavailabilityDto[];
}

export interface TrainerSchedulingSetupResponseDto {
  availability: SetupAvailabilityDto | null;
  settings: SetupBookingSettingsDto | null;
  unavailabilities: SetupUnavailabilityDto[];
}

export interface UpdateShiftDto {
  startMinute: number;
  endMinute: number;
}

export interface UpdateWeeklyScheduleDto {
  dayOfWeek: DayOfWeek;
  isAvailable: boolean;
  shifts: UpdateShiftDto[];
}

export interface UpdateTrainerAvailabilityDto {
  effectiveFrom: string;
  effectiveUntil: string;
  timeZone: string;
  weeklySchedule: UpdateWeeklyScheduleDto[];
  status?: AvailabilityStatus;
}

export interface UpdateTrainerBookingSettingsDto {
  serviceIds?: string[];
  advanceNoticeHours?: AdvanceNoticeHours;
  bufferMinutes?: BufferTimeMinutes;
  maximumBookingPerDay?: MaxBookingLimits;
}

export interface CreateTrainerOverrideDto {
  date: Date | string;
  shifts: ShiftDto[];
  reason?: string;
}

export interface UpdateTrainerOverrideDto {
  date?: Date | string;
  shifts?: ShiftDto[];
  reason?: string;
  status?: "ACTIVE" | "CANCELLED";
}