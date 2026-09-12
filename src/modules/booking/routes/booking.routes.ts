import { Router } from "express";
import container from "@/container/container";
import { BOOKING_TYPES } from "../booking.types";
import { TrainerSchedulingController } from "../controller/trainer-scheduling.controller";
import { BookingCancellationController } from "../controller/booking-cancellation.controller";
import { BookingRescheduleController } from "../controller/booking-reschedule.controller";
import { BookingSlotController } from "../controller/booking-slot.controller";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import { BOOKING_PATHS } from "@/constants/routes.constant/booking.constant";
import { validate } from "@/middleware/validate";
import {
  cancelBookingSchema,
  createBookingSchema,
  createOverrideSchema,
  createSetupSchema,
  createUnavailabilitySchema,
  deleteOverrideSchema,
  deleteUnavailabilitySchema,
  getAvailableDatesSchema,
  getSlotsSchema,
  proposeRescheduleSchema,
  respondRescheduleSchema,
  updateAvailabilitySchema,
  updateBookingSettingsSchema,
  updateOverrideSchema,
  updateUnavailabilitySchema,
  verifyPaymentSchema,
  withdrawRescheduleSchema,
} from "../validation/booking.zod.validation";

const trainerSchedulingController = container.get<TrainerSchedulingController>(
  BOOKING_TYPES.TrainerSchedulingController,
);
const bookingCancellationController = container.get<BookingCancellationController>(
  BOOKING_TYPES.BookingCancellationController,
);
const bookingRescheduleController = container.get<BookingRescheduleController>(
  BOOKING_TYPES.BookingRescheduleController,
);
const bookingSlotController = container.get<BookingSlotController>(
  BOOKING_TYPES.BookingSlotController,
);

const bookingRoute = Router();

// Setup Routes
bookingRoute.post(
  BOOKING_PATHS.SETUP,
  ROLE_GUARD.TRAINER_GUARD,
  validate(createSetupSchema),
  trainerSchedulingController.createSetup,
);

bookingRoute.get(
  BOOKING_PATHS.SETUP,
  ROLE_GUARD.TRAINER_GUARD,
  trainerSchedulingController.getSetup,
);

// Availability Routes
bookingRoute.put(
  BOOKING_PATHS.AVAILABILITY,
  ROLE_GUARD.TRAINER_GUARD,
  validate(updateAvailabilitySchema),
  trainerSchedulingController.updateAvailability,
);

// Settings Routes
bookingRoute.put(
  BOOKING_PATHS.SETTINGS,
  ROLE_GUARD.TRAINER_GUARD,
  validate(updateBookingSettingsSchema),
  trainerSchedulingController.updateBookingSettings,
);

// Unavailability (Leave) Routes
bookingRoute.post(
  BOOKING_PATHS.UNAVAILABILITY,
  ROLE_GUARD.TRAINER_GUARD,
  validate(createUnavailabilitySchema),
  trainerSchedulingController.createUnavailability,
);

bookingRoute.get(
  BOOKING_PATHS.UNAVAILABILITY,
  ROLE_GUARD.TRAINER_GUARD,
  trainerSchedulingController.getUnavailabilities,
);

bookingRoute.put(
  BOOKING_PATHS.UNAVAILABILITY_BY_ID,
  ROLE_GUARD.TRAINER_GUARD,
  validate(updateUnavailabilitySchema),
  trainerSchedulingController.updateUnavailability,
);

bookingRoute.delete(
  BOOKING_PATHS.UNAVAILABILITY_BY_ID,
  ROLE_GUARD.TRAINER_GUARD,
  validate(deleteUnavailabilitySchema),
  trainerSchedulingController.deleteUnavailability,
);

// Overrides Routes
bookingRoute.post(
  BOOKING_PATHS.OVERRIDES,
  ROLE_GUARD.TRAINER_GUARD,
  validate(createOverrideSchema),
  trainerSchedulingController.createOverride,
);

bookingRoute.get(
  BOOKING_PATHS.OVERRIDES,
  ROLE_GUARD.TRAINER_GUARD,
  trainerSchedulingController.getOverrides,
);

bookingRoute.put(
  BOOKING_PATHS.OVERRIDE_BY_ID,
  ROLE_GUARD.TRAINER_GUARD,
  validate(updateOverrideSchema),
  trainerSchedulingController.updateOverride,
);

bookingRoute.delete(
  BOOKING_PATHS.OVERRIDE_BY_ID,
  ROLE_GUARD.TRAINER_GUARD,
  validate(deleteOverrideSchema),
  trainerSchedulingController.deleteOverride,
);

// Slots Route
bookingRoute.get(
  BOOKING_PATHS.SLOTS,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(getSlotsSchema),
  bookingSlotController.getAvailableSlots,
);

// Available Dates Overview (Monthly Calendar)
bookingRoute.get(
  BOOKING_PATHS.AVAILABLE_DATES,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(getAvailableDatesSchema),
  bookingSlotController.getAvailableDates,
);

// Booking Creation & Verification
bookingRoute.post(
  BOOKING_PATHS.CREATE,
  ROLE_GUARD.USER_GUARD,
  validate(createBookingSchema),
  trainerSchedulingController.createBooking,
);

bookingRoute.post(
  BOOKING_PATHS.VERIFY_PAYMENT,
  ROLE_GUARD.USER_GUARD,
  validate(verifyPaymentSchema),
  trainerSchedulingController.verifyBookingPayment,
);

bookingRoute.get(
  BOOKING_PATHS.USER_BOOKINGS,
  ROLE_GUARD.USER_GUARD,
  trainerSchedulingController.getUserBookings,
);

bookingRoute.get(
  BOOKING_PATHS.TRAINER_BOOKINGS,
  ROLE_GUARD.TRAINER_GUARD,
  trainerSchedulingController.getTrainerBookings,
);

bookingRoute.get(
  "/:id",
  ROLE_GUARD.USER_GUARD,
  trainerSchedulingController.getBookingById,
);

// Cancellation Routes
bookingRoute.post(
  "/:id/cancel",
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(cancelBookingSchema),
  bookingCancellationController.cancelBooking,
);

// Reschedule Proposal Routes (Trainer -> User)
bookingRoute.post(
  "/:id/reschedule/trainer-propose",
  ROLE_GUARD.TRAINER_GUARD,
  validate(proposeRescheduleSchema),
  bookingRescheduleController.proposeRescheduleByTrainer,
);

bookingRoute.post(
  "/reschedule-request/:requestId/respond",
  ROLE_GUARD.USER_GUARD,
  validate(respondRescheduleSchema),
  bookingRescheduleController.respondToRescheduleRequest,
);

bookingRoute.post(
  "/reschedule-request/:requestId/withdraw",
  ROLE_GUARD.TRAINER_GUARD,
  validate(withdrawRescheduleSchema),
  bookingRescheduleController.withdrawRescheduleProposal,
);

bookingRoute.get(
  "/user/reschedule-requests",
  ROLE_GUARD.USER_GUARD,
  bookingRescheduleController.getUserPendingRescheduleRequests,
);

export default bookingRoute;