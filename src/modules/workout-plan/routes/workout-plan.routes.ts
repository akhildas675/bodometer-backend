import { Router } from "express";
import container from "../../../container/container";
import { WORKOUT_PLAN_TYPES } from "../workout-plan.types";
import { WorkoutPlanController } from "../controller/workout-plan.controller";

import { ROLE_GUARD } from "../../../constants/role.guard";
import { WORKOUT_PATHS } from "@/constants/routes.constant/workout.paths";

// Assuming USER_ROUTES values from user.routes.ts constants
const workoutPlanRouter = Router();

const workoutPlanController = container.get<WorkoutPlanController>(WORKOUT_PLAN_TYPES.WorkoutPlanController);


workoutPlanRouter.post(
  WORKOUT_PATHS.GENERATE,
  ROLE_GUARD.USER_GUARD,
  workoutPlanController.generateWorkout,
);

workoutPlanRouter.get(
  WORKOUT_PATHS.ROOT,
  ROLE_GUARD.USER_GUARD,
  workoutPlanController.getWorkoutPlans,
);

workoutPlanRouter.patch(
  WORKOUT_PATHS.DAY_COMPLETE,
  ROLE_GUARD.USER_GUARD,
  workoutPlanController.markDayCompleted,
);

workoutPlanRouter.patch(
  WORKOUT_PATHS.EXERCISE_COMPLETE,
  ROLE_GUARD.USER_GUARD,
  workoutPlanController.markExerciseStatus,
);

workoutPlanRouter.get(
  WORKOUT_PATHS.PROGRESS,
  ROLE_GUARD.USER_GUARD,
  workoutPlanController.getWorkoutProgress,
);

export default workoutPlanRouter;
