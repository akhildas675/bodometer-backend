import { SlotDuration, SlotStatus } from "@/constants/constant.values.ts/booking.constant";

// ── Availability ──────────────────────────────────────────────────────────────

export interface CreateAvailabilityDto {
  date: Date;
  shifts: {
    startTime: Date;
    endTime: Date;
    duration: SlotDuration;
  }[];
}

// ── Slot ──────────────────────────────────────────────────────────────────────

export interface CreateSlotDto {
  availabilityId: string;
  trainerId: string;
  startTime: Date;
  endTime: Date;
  status?: SlotStatus;
}

// ── Booking ───────────────────────────────────────────────────────────────────

/**
 * Payload from the user when creating a booking.
 */
export interface CreateBookingDto {
  slotId: string;
  note?: string;
}

/**
 * Payload for rejecting a booking (trainer → requires a reason).
 */
export interface RejectBookingDto {
  reason: string;
}

/**
 * Payload for cancelling a booking (user or trainer → reason is mandatory).
 */
export interface CancelBookingDto {
  reason: string;
}