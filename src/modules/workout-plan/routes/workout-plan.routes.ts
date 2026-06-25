import { Router } from "express";
import container from "../../../container/container";
import { WORKOUT_PLAN_TYPES } from "../workout-plan.types";
import { WorkoutPlanController } from "../controller/workout-plan.controller";
import { authGuard as authMiddleware } from "../../../middleware/authGuard";
import { ROLE_GUARD } from "../../../constants/role.guard";

// Assuming USER_ROUTES values from user.routes.ts constants
const workoutPlanRouter = Router();

const workoutPlanController = container.get<WorkoutPlanController>(WORKOUT_PLAN_TYPES.WorkoutPlanController);

// Note: these routes were mounted at /api/user, so the paths here should match what USER_ROUTES had.
// Let's use the exact paths from USER_ROUTES.
// wait, we can just import USER_ROUTES
import { USER_ROUTES } from "../../../constants/routes.constant/user-routes.constant";

// Actually, in routes.ts we will mount this at `/api/user`. So we can reuse the constants.
workoutPlanRouter.post(
  USER_ROUTES.GENERATE_WORKOUT,
  ROLE_GUARD.USER_GUARD,
  workoutPlanController.generateWorkout,
);

workoutPlanRouter.get(
  USER_ROUTES.GET_WORKOUT_PLANS,
  ROLE_GUARD.USER_GUARD,
  workoutPlanController.getWorkoutPlans,
);

workoutPlanRouter.patch(
  USER_ROUTES.MARK_WORKOUT_DAY,
  ROLE_GUARD.USER_GUARD,
  workoutPlanController.markDayCompleted,
);

workoutPlanRouter.patch(
  USER_ROUTES.MARK_WORKOUT_EXERCISE,
  ROLE_GUARD.USER_GUARD,
  workoutPlanController.markExerciseStatus,
);

workoutPlanRouter.get(
  USER_ROUTES.GET_WORKOUT_PROGRESS,
  ROLE_GUARD.USER_GUARD,
  workoutPlanController.getWorkoutProgress,
);

export default workoutPlanRouter;
