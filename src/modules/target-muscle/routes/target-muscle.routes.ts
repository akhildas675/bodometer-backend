import container from "@/container/container";
import { Router } from "express";
import { TargetMuscleController } from "../controller/target-muscle.controller";
import { TARGET_MUSCLE_TYPES } from "../target-muscle.types";
import { ROLE_GUARD } from "@/constants/role.guard";
import { mediaUpload } from "@/config/multer";
import { validate } from "@/middleware/validate";
import {
  createTargetMuscleSchema,
  updateTargetMuscleSchema,
} from "../validation/target-muscle.validator";
import { TARGET_MUSCLE_PATHS } from "@/constants/routes.constant/target-muscles.path";


const targetMuscleRoute = Router();

const targetMuscleController = container.get<TargetMuscleController>(TARGET_MUSCLE_TYPES.Controller);

targetMuscleRoute.post(
  TARGET_MUSCLE_PATHS.ROOT,
  ROLE_GUARD.ADMIN_GUARD,
  mediaUpload.single("image"),
  validate(createTargetMuscleSchema),
  targetMuscleController.createTargetMuscle,
);

targetMuscleRoute.put(
  TARGET_MUSCLE_PATHS.BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  mediaUpload.single("image"),
  validate(updateTargetMuscleSchema),
  targetMuscleController.updateTargetMuscle,
);

targetMuscleRoute.get(
  TARGET_MUSCLE_PATHS.BY_ID,
  ROLE_GUARD.ALL_GUARDS,
  targetMuscleController.getTargetMuscleById,
);

targetMuscleRoute.get(
  TARGET_MUSCLE_PATHS.ROOT,
  ROLE_GUARD.ALL_GUARDS,
  targetMuscleController.getAllTargetMuscles,
);

targetMuscleRoute.patch(
  TARGET_MUSCLE_PATHS.STATUS,
  ROLE_GUARD.ADMIN_GUARD,
  targetMuscleController.toggleTargetMuscleStatus,
);

export default targetMuscleRoute;
