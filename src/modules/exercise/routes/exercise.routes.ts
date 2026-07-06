import container from "@/container/container";
import { Router } from "express";
import { ExerciseController } from "../controller/exercise.controller";
import { EXERCISE_TYPES } from "../exercise.types";
import { ROLE_GUARD } from "@/constants/role.guard";
import { mediaUpload } from "@/config/multer";
import { validate } from "@/middleware/validate";
import {
    createExerciseSchema,
    updateExerciseSchema,
    getAllExercisesSchema,
} from "../validation/exercise.validator";
import { EXERCISE_PATH } from "@/constants/routes.constant/exercise.paths";

const exerciseRoute = Router();

const exerciseController = container.get<ExerciseController>(EXERCISE_TYPES.Controller);

exerciseRoute.post(
    EXERCISE_PATH.ROOT,
    ROLE_GUARD.ADMIN_GUARD,
    mediaUpload.fields([
        { name: "image", maxCount: 1 },
        { name: "video", maxCount: 1 },
    ]),
    validate(createExerciseSchema),
    exerciseController.createExercise,
);

exerciseRoute.put(
    EXERCISE_PATH.BY_ID,
    ROLE_GUARD.ADMIN_GUARD,
    mediaUpload.fields([
        { name: "image", maxCount: 1 },
        { name: "video", maxCount: 1 },
    ]),
    validate(updateExerciseSchema),
    exerciseController.updateExercise,
);

exerciseRoute.get(
    EXERCISE_PATH.BY_ID,
    ROLE_GUARD.ALL_GUARDS,
    exerciseController.getExerciseById,
);

exerciseRoute.get(
    EXERCISE_PATH.ROOT,
    ROLE_GUARD.ALL_GUARDS,
    validate(getAllExercisesSchema),
    exerciseController.getAllExercises,
);

exerciseRoute.patch(
    EXERCISE_PATH.STATUS,
    ROLE_GUARD.ADMIN_GUARD,
    exerciseController.toggleExerciseStatus,
);

export default exerciseRoute;
