export const BOOKING_TYPES = {
  // ── Repositories ────────────────────────────────────────────────────────────
  TrainerAvailabilityRepository: Symbol.for("TrainerAvailabilityRepository"),
  TrainerSlotRepository: Symbol.for("TrainerSlotRepository"),
  BookingRepository: Symbol.for("BookingRepository"),

  // ── Services ────────────────────────────────────────────────────────────────
  TrainerSlotService: Symbol.for("TrainerSlotService"),
  TrainerAvailabilityService: Symbol.for("TrainerAvailability"),
  BookingService: Symbol.for("BookingService"),

  // ── Validation ──────────────────────────────────────────────────────────────
  TrainerAvailabilityValidation: Symbol.for("TrainerAvailabilityValidation"),
  BookingValidation: Symbol.for("BookingValidation"),

  // ── Controllers ─────────────────────────────────────────────────────────────
  TrainerSlotController: Symbol.for("TrainerSlotController"),
  TrainerAvailabilityController: Symbol.for("TrainerAvailabilityController"),
  BookingController: Symbol.for("BookingController"),
};