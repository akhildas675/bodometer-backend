export const BOOKING_MOUNTS = {
  AVAILABILITY: "/availability",
  SLOTS: "/slots",
  BOOKINGS: "/bookings",
} as const;

export const AVAILABILITY_PATHS = {
  ROOT: "/",
  BY_ID: "/:availabilityId",
} as const;

export const SLOT_PATHS = {
  ROOT: "/",
  BY_ID: "/:slotId",
  TRAINER_SLOTS: "/trainers/:trainerId",
} as const;

export const BOOKING_PATHS = {
  ROOT: "/",
  BY_ID: "/:bookingId",
  ACCEPT: "/:bookingId/accept",
  REJECT: "/:bookingId/reject",
  CANCEL: "/:bookingId/cancel",
  RESCHEDULE: "/:bookingId/reschedule",
  COMPLETE: "/:bookingId/complete",
  NOT_ATTENDED: "/:bookingId/not-attended",
} as const;

export const COACHING_PATHS = {
  ROOT: "/",
  BY_ID: "/:serviceId",
  TOGGLE_STATUS: "/:serviceId/toggle",
} as const;