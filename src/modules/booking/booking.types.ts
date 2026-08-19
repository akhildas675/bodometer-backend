export const BOOKING_TYPES = {
  // Repositories
  TrainerAvailabilityRepository: Symbol.for("TrainerAvailabilityRepository"),
  TrainerBookingSettingsRepository: Symbol.for("TrainerBookingSettingsRepository"),
  TrainerUnavailabilityRepository: Symbol.for("TrainerUnavailabilityRepository"),
  TrainerAvailabilityOverrideRepository: Symbol.for("TrainerAvailabilityOverrideRepository"),
  BookingRepository: Symbol.for("BookingRepository"),
  BookingAuditLogRepository: Symbol.for("BookingAuditLogRepository"),
  BookingCancellationRepository: Symbol.for("BookingCancellationRepository"),
  BookingRescheduleRequestRepository: Symbol.for("BookingRescheduleRequestRepository"),
  BookingRefundRepository: Symbol.for("BookingRefundRepository"),

  // Services
  TrainerSchedulingService: Symbol.for("TrainerSchedulingService"),
  BookingSlotEngineService: Symbol.for("BookingSlotEngineService"),
  BookingService: Symbol.for("BookingService"),
  BookingCancellationService: Symbol.for("BookingCancellationService"),
  BookingRescheduleService: Symbol.for("BookingRescheduleService"),
  BookingRefundService: Symbol.for("BookingRefundService"),
  BookingLifecycleService: Symbol.for("BookingLifecycleService"),

  // Controllers
  TrainerSchedulingController: Symbol.for("TrainerSchedulingController"),
  BookingCancellationController: Symbol.for("BookingCancellationController"),
  BookingRescheduleController: Symbol.for("BookingRescheduleController"),
  BookingSlotController: Symbol.for("BookingSlotController"),
} as const;