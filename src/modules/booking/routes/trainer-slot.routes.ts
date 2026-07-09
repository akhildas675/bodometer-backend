import { Router } from "express";
import { BOOKING_TYPES } from "../booking.types";
import { SLOT_PATHS } from "@/constants/routes.constant/booking.paths";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import container from "@/container/container";
import { TrainerSlotController } from "../controller/trainer-slot.controller";

const trainerSlotRoute = Router();

const trainerSlotController = container.get<TrainerSlotController>(
  BOOKING_TYPES.TrainerSlotController
);

// ── Trainer: view own slots (filterable) ─────────────────────────────────────
// GET /api/booking/slots
trainerSlotRoute.get(
  SLOT_PATHS.ROOT,
  ROLE_GUARD.TRAINER_GUARD,
  trainerSlotController.getTrainerSlots
);

// ── User: view available slots for a specific trainer ─────────────────────────
// GET /api/booking/slots/trainers/:trainerId
trainerSlotRoute.get(
  SLOT_PATHS.TRAINER_SLOTS,
  ROLE_GUARD.USER_TRAINER_GUARD,
  trainerSlotController.getTrainerAvailableSlots
);

// ── Trainer: block a slot ────────────────────────────────────────────────────
// PATCH /api/booking/slots/:slotId/block
trainerSlotRoute.patch(
  "/:slotId/block",
  ROLE_GUARD.TRAINER_GUARD,
  trainerSlotController.blockSlot
);

// ── Trainer: unblock a slot ──────────────────────────────────────────────────
// PATCH /api/booking/slots/:slotId/unblock
trainerSlotRoute.patch(
  "/:slotId/unblock",
  ROLE_GUARD.TRAINER_GUARD,
  trainerSlotController.unblockSlot
);

export default trainerSlotRoute;
