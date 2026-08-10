export const BOOKING_STATUS = {
  PENDING: "PENDING",
  PENDING_PAYMENT: "PENDING_PAYMENT",
  CONFIRMED: "CONFIRMED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  RESCHEDULED: "RESCHEDULED",
  RESCHEDULE_PENDING: "RESCHEDULE_PENDING",
  COMPLETED: "COMPLETED",
  NOT_ATTENDED: "NO_SHOW",
  CANCELLED: "CANCELLED",
  CANCELLED_BY_TRAINER: "CANCELLED_BY_TRAINER",
  CANCELLED_BY_USER: "CANCELLED_BY_USER",
  EXPIRED: "EXPIRED",
  NO_SHOW: "NO_SHOW",
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const SLOT_STATUS = {
  AVAILABLE: "available",
  BOOKED: "booked",
  EXPIRED: "expired",
  BLOCKED: "blocked",
} as const;

export type SlotStatus = typeof SLOT_STATUS[keyof typeof SLOT_STATUS];

export const COACHING_DURATION = {
  THIRTY: 30,
  FORTY_FIVE: 45,
  SIXTY: 60,
} as const;

export type CoachingDuration = typeof COACHING_DURATION[keyof typeof COACHING_DURATION];

export const SLOT_DURATION_OPTIONS = [
  { label: "30 Minutes", value: 30 },
  { label: "45 Minutes", value: 45 },
  { label: "60 Minutes", value: 60 },
] as const;

export const BOOKING_MODE = {
  ONLINE: "Online",
} as const;

export type BookingMode = typeof BOOKING_MODE[keyof typeof BOOKING_MODE];

export const SLOT_DURATION = {
  THIRTY: 30,
  FORTY_FIVE: 45,
  SIXTY: 60,
} as const;

export type SlotDuration = typeof SLOT_DURATION[keyof typeof SLOT_DURATION];

export const AVAILABILITY_STATUS = {
  ACTIVE: "ACTIVE",
  FUTURE: "FUTURE",
  EXPIRED: "EXPIRED",
  DRAFT: "DRAFT",
} as const;

export type AvailabilityStatus = typeof AVAILABILITY_STATUS[keyof typeof AVAILABILITY_STATUS];

export const DAY_OF_WEEK = {
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
  SUNDAY: "SUNDAY",
} as const;

export type DayOfWeek = typeof DAY_OF_WEEK[keyof typeof DAY_OF_WEEK];

export const ADVANCE_NOTICE_HOURS = {
  TWO: 2,
  FOUR: 4,
  SIX: 6,
  TWELVE: 12,
  TWENTY_FOUR: 24,
  FORTY_EIGHT: 48,
  SEVENTY_TWO: 72,
} as const;

export type AdvanceNoticeHours = typeof ADVANCE_NOTICE_HOURS[keyof typeof ADVANCE_NOTICE_HOURS];

export const BUFFER_TIME_MINUTES = {
  TEN: 10,
  FIFTEEN: 15,
  TWENTY: 20,
  THIRTY: 30,
} as const;

export type BufferTimeMinutes = typeof BUFFER_TIME_MINUTES[keyof typeof BUFFER_TIME_MINUTES];

export const MAX_BOOKING_LIMITS = {
  FIVE: 5,
  EIGHT: 8,
  TEN: 10,
  TWELVE: 12,
} as const;

export type MaxBookingLimits = typeof MAX_BOOKING_LIMITS[keyof typeof MAX_BOOKING_LIMITS];

export const MAX_AVAILABILITY_DAYS = 90;
export const MINUTES_PER_DAY = 1440;
export const MIN_SHIFT_DURATION_MINUTES = 30;
export const MAX_BUFFER_MINUTES = 120;

export const RESCHEDULE_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

export type RescheduleStatus = typeof RESCHEDULE_STATUS[keyof typeof RESCHEDULE_STATUS];

export const AUDIT_LOG_ACTION = {
  CREATED: "CREATED",
  CANCELLED: "CANCELLED",
  RESCHEDULED: "RESCHEDULED",
  RESCHEDULE_PROPOSED: "RESCHEDULE_PROPOSED",
  STATUS_CHANGED: "STATUS_CHANGED",
  UPDATED: "UPDATED",
} as const;

export type AuditLogAction = typeof AUDIT_LOG_ACTION[keyof typeof AUDIT_LOG_ACTION];

export const CANCELLATION_POLICY = {
  ADVANCE_24H_PLUS: "USER_CANCEL_ADVANCE_24H_PLUS",
  STANDARD_6H_TO_24H: "USER_CANCEL_STANDARD_6H_TO_24H",
  LATE_UNDER_6H: "USER_CANCEL_LATE_UNDER_6H",
  TRAINER_FULL_REFUND: "TRAINER_CANCELLATION_FULL_REFUND",
} as const;

export const CANCELLATION_REFUND_PERCENT = {
  FULL: 100,
  PARTIAL: 50,
  NONE: 0,
} as const;

export const CANCELLATION_NOTICE_HOURS = {
  ADVANCE_THRESHOLD: 24,
  STANDARD_THRESHOLD: 6,
} as const;

export const RESCHEDULE_EXPIRY_HOURS = 24;
export const MS_PER_HOUR = 3600000;
