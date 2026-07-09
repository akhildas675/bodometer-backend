import { Router } from "express";

import { BOOKING_TYPES } from "../booking.types";
import { AVAILABILITY_PATHS } from "@/constants/routes.constant/booking.paths";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import container from "@/container/container";
import { TrainerAvailabilityController } from "../controller/trainer-availability.controller";

const trainerAvailabilityRoute = Router();

const trainerAvailabilityController =
  container.get<TrainerAvailabilityController>(
    BOOKING_TYPES.TrainerAvailabilityController,
  );

trainerAvailabilityRoute.post(
  AVAILABILITY_PATHS.ROOT,
  ROLE_GUARD.TRAINER_GUARD,
  trainerAvailabilityController.createAvailability,
);

export default trainerAvailabilityRoute;
