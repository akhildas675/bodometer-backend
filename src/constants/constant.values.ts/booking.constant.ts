export const BOOKING_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  RESCHEDULED: "rescheduled",
  COMPLETED: "completed",
  NOT_ATTENDED: "not_attended",
  CANCELLED_BY_TRAINER: "cancelled_by_trainer",
  CANCELLED_BY_USER: "cancelled_by_user",
  EXPIRED: "expired",
} as const;

export type BookingStatus =
  typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];


export const SLOT_STATUS={
    AVAILABLE:"available",
    BOOKED:"booked",
    EXPIRED:"expired",
    BLOCKED:"blocked",
} as const;

export type SlotStatus = typeof SLOT_STATUS[keyof typeof SLOT_STATUS];

export const COACHING_DURATION = {
  THIRTY: 30,
  FORTY_FIVE: 45,
  SIXTY: 60,
} as const;

export type CoachingDuration =
  typeof COACHING_DURATION[keyof typeof COACHING_DURATION];




  export const SLOT_DURATION_OPTIONS = [
  { label: "30 Minutes", value: 30 },
  { label: "45 Minutes", value: 45 },
  { label: "60 Minutes", value: 60 },
] as const;


export const BOOKING_MODE={
  ONLINE:"Online"
}

export type BookingMode = typeof BOOKING_MODE[keyof typeof BOOKING_MODE]


export const SLOT_DURATION = {
  THIRTY: 30,
  FORTY_FIVE: 45,
  SIXTY: 60,
} as const;
export type SlotDuration = typeof SLOT_DURATION[keyof typeof SLOT_DURATION];
