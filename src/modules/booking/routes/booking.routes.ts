import { Router } from "express";
import trainerAvailabilityRoute from "./trainer-availability.routes";
import trainerSlotRoute from "./trainer-slot.routes";
import bookingActionRoute from "./booking-action.routes";
import { BOOKING_MOUNTS } from "@/constants/routes.constant/booking.paths";

const bookingRoute = Router();

bookingRoute.use(BOOKING_MOUNTS.AVAILABILITY, trainerAvailabilityRoute);
bookingRoute.use(BOOKING_MOUNTS.SLOTS, trainerSlotRoute);
bookingRoute.use(BOOKING_MOUNTS.BOOKINGS, bookingActionRoute);

export default bookingRoute;