import container from "@/container/container";
import { CoachingController } from "../controller/coaching.controller";
import { COACHING_TYPES } from "../coaching.types";
import { Router } from "express";
import { COACHING_PATHS } from "@/constants/routes.constant/booking.paths";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import { validate } from "@/middleware/validate";
import {
  coachingValidationSchema,
  coachingUpdateSchema,
  coachingIdParamSchema,
} from "../validation/coaching.validation";

const coachingRoute = Router();
const coachingController = container.get<CoachingController>(COACHING_TYPES.CoachingController);

coachingRoute.post(
  COACHING_PATHS.ROOT,
  ROLE_GUARD.ADMIN_GUARD,
  validate(coachingValidationSchema),
  coachingController.createCoaching
);

coachingRoute.get(
  COACHING_PATHS.ROOT,
  ROLE_GUARD.ALL_GUARDS,
  coachingController.getCoaching
);

coachingRoute.get(
  COACHING_PATHS.BY_ID,
  ROLE_GUARD.ALL_GUARDS,
  validate(coachingIdParamSchema),
  coachingController.getCoachingServiceById
);

coachingRoute.put(
  COACHING_PATHS.BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  validate(coachingUpdateSchema.merge(coachingIdParamSchema)),
  coachingController.updateCoachingService
);

coachingRoute.patch(
  COACHING_PATHS.TOGGLE_STATUS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(coachingIdParamSchema),
  coachingController.toggleCoachingStatus
);

export default coachingRoute;