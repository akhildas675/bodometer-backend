import { Router } from "express";
import { ADMIN_ROUTES } from "../../constants/routes.constant/admin-routes.constant";
import { ROLE_GUARD } from "../../constants/role.guard";
import { validate } from "../../middleware/validate";
import { imageUpload } from "../../config/multer";
import { createAdminModule } from "../../modules/admin/admin.module";
import { addWorkoutSchema, getWorkoutsSchema } from "../../validators/admin/admin-validator";

const adminRoute = Router();
const { adminController } = createAdminModule();

// Workout Management
adminRoute.post(
  ADMIN_ROUTES.ADD_WORKOUT,
  ROLE_GUARD.ADMIN_GUARD,
  imageUpload.single("workoutImage"),
  validate(addWorkoutSchema),
  adminController.addWorkout,
);

adminRoute.get(
  ADMIN_ROUTES.GET_WORKOUTS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(getWorkoutsSchema),
  adminController.getWorkout,
);

export default adminRoute;