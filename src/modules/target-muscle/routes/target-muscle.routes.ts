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
} from "@/validators/admin/admin-validator";


const targetMuscleRoute = Router();

const targetMuscleController = container.get<TargetMuscleController>(TARGET_MUSCLE_TYPES.Controller);

targetMuscleRoute.post(
  "/",
  ROLE_GUARD.ADMIN_GUARD,
  mediaUpload.single("image"),
  validate(createTargetMuscleSchema),
  targetMuscleController.createTargetMuscle,
);

targetMuscleRoute.put(
  "/:id",
  ROLE_GUARD.ADMIN_GUARD,
  mediaUpload.single("image"),
  validate(updateTargetMuscleSchema),
  targetMuscleController.updateTargetMuscle,
);

targetMuscleRoute.get(
  "/:id",
  ROLE_GUARD.ALL_GUARDS,
  targetMuscleController.getTargetMuscleById,
);

targetMuscleRoute.get(
  "/",
  ROLE_GUARD.ALL_GUARDS,
  targetMuscleController.getAllTargetMuscles,
);

targetMuscleRoute.patch(
  "/:id/status",
  ROLE_GUARD.ADMIN_GUARD,
  targetMuscleController.toggleTargetMuscleStatus,
);

export default targetMuscleRoute;
