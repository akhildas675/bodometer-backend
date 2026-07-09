import { Router } from "express";
import { BOOKING_TYPES } from "../booking.types";
import { BOOKING_PATHS } from "@/constants/routes.constant/booking.paths";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import container from "@/container/container";
import { BookingController } from "../controller/booking.controller";

const bookingActionRoute = Router();

const bookingController = container.get<BookingController>(
  BOOKING_TYPES.BookingController
);

// ── User: create booking ──────────────────────────────────────────────────────
// POST /api/booking/bookings
bookingActionRoute.post(
  BOOKING_PATHS.ROOT,
  ROLE_GUARD.USER_GUARD,
  bookingController.createBooking
);

// ── Trainer: view own bookings ────────────────────────────────────────────────
// GET /api/booking/bookings
bookingActionRoute.get(
  BOOKING_PATHS.ROOT,
  ROLE_GUARD.TRAINER_GUARD,
  bookingController.getTrainerBookings
);

// ── User: view own bookings ───────────────────────────────────────────────────
// GET /api/booking/bookings/my
bookingActionRoute.get(
  "/my",
  ROLE_GUARD.USER_GUARD,
  bookingController.getUserBookings
);

// ── Trainer: accept booking ───────────────────────────────────────────────────
// PATCH /api/booking/bookings/:bookingId/accept
bookingActionRoute.patch(
  BOOKING_PATHS.ACCEPT,
  ROLE_GUARD.TRAINER_GUARD,
  bookingController.acceptBooking
);

// ── Trainer: reject booking ───────────────────────────────────────────────────
// PATCH /api/booking/bookings/:bookingId/reject
bookingActionRoute.patch(
  BOOKING_PATHS.REJECT,
  ROLE_GUARD.TRAINER_GUARD,
  bookingController.rejectBooking
);

// ── User or Trainer: cancel booking ──────────────────────────────────────────
// PATCH /api/booking/bookings/:bookingId/cancel
bookingActionRoute.patch(
  BOOKING_PATHS.CANCEL,
  ROLE_GUARD.USER_TRAINER_GUARD,
  bookingController.cancelBooking
);

export default bookingActionRoute;
