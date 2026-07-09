export const BOOKING_MESSAGES = {
  BOOKING: {
    BOOKING_CREATED: "Booking created successfully.",
    BOOKING_CREATED_FAILED: "Failed to create booking.",

    BOOKING_ACCEPTED: "Booking accepted successfully.",
    BOOKING_REJECTED: "Booking rejected successfully.",
    BOOKING_CANCELLED: "Booking cancelled successfully.",
    BOOKING_COMPLETED: "Booking marked as completed.",

    BOOKING_NOT_FOUND: "Booking not found.",
    BOOKING_ALREADY_EXISTS: "You have already booked this slot.",
    BOOKING_ALREADY_CANCELLED: "Booking has already been cancelled.",
    BOOKING_ALREADY_COMPLETED: "Booking has already been completed.",
    BOOKING_ALREADY_PROCESSED:
      "This booking has already been accepted or rejected.",
    BOOKING_EXPIRED: "Booking has expired.",

    BOOKING_UNAUTHORIZED:
      "You are not authorised to perform this action on this booking.",
    BOOKING_CANNOT_CANCEL:
      "Only pending or accepted bookings can be cancelled.",
    BOOKING_NOT_PENDING:
      "Only pending bookings can be accepted or rejected.",
  },

  AVAILABILITY: {
    AVAILABILITY_CREATED: "Availability created successfully.",
    AVAILABILITY_CREATE_FAILED: "Failed to create availability.",

    AVAILABILITY_NOT_FOUND: "Availability not found.",

    PAST_DATE_NOT_ALLOWED: "Past dates cannot be selected.",

    DATE_OUT_OF_RANGE:
      "Availability can only be created for the next 7 days.",

    PAST_TIME_NOT_ALLOWED:
      "Past time cannot be selected for today's availability.",

    INVALID_TIME_RANGE: "Start time must be earlier than end time.",

    SAME_START_AND_END_TIME:
      "Start time and end time cannot be the same.",

    INVALID_SHIFT_DURATION:
      "Shift duration is shorter than the selected slot duration.",

    INVALID_SLOT_DURATION: "Slot duration must be 30, 45, or 60 minutes.",

    SHIFT_OVERLAP: "Shifts cannot overlap.",

    DUPLICATE_SHIFT: "Duplicate shifts are not allowed.",

    EXISTING_AVAILABILITY_OVERLAP:
      "This shift overlaps with your existing availability.",

    CROSS_MIDNIGHT_NOT_ALLOWED: "A shift cannot span multiple days.",

    EMPTY_SHIFT: "At least one shift is required.",
    MAXIMUM_SHIFT_LIMIT: "A maximum of 4 shifts can be created per day.",
  },

  SLOT: {
    SLOT_CREATED: "Trainer slots generated successfully.",
    SLOT_CREATE_FAILED: "Failed to generate trainer slots.",

    SLOT_NOT_FOUND: "Slot not found.",
    SLOT_ALREADY_BOOKED: "This slot has already been booked.",
    SLOT_EXPIRED: "This slot has expired.",
    SLOT_NOT_AVAILABLE: "This slot is no longer available.",
  },
} as const;