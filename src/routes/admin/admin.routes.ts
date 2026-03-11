import { Router } from "express";
import { ADMIN_ROUTES } from "@/constants/routes.constant/admin-routes.constant";
import { ROLE_GUARD } from "@/constants/role.guard";
import { validate } from "@/middleware/validate";
import { imageUpload } from "@/config/multer";
import { createAdminModule } from "@/modules/admin/admin.module";
import {
  addWorkoutSchema,
  getWorkoutsSchema,
  addSubscriptionSchema,
  updateSubscriptionSchema,
} from "@/validators/admin/admin-validator";

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

// Subscription Management
adminRoute.post(
  ADMIN_ROUTES.ADD_SUBSCRIPTION,
  ROLE_GUARD.ADMIN_GUARD,
  validate(addSubscriptionSchema),
  adminController.createSubscription,
);
adminRoute.get(
  ADMIN_ROUTES.GET_ALL_SUBSCRIPTIONS,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllSubscriptions,
);
adminRoute.get(
  ADMIN_ROUTES.GET_SUBSCRIPTION_BY_ID(":id"),   
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getSubscriptionById,
);
adminRoute.put(
  ADMIN_ROUTES.UPDATE_SUBSCRIPTION(":id"),       
  ROLE_GUARD.ADMIN_GUARD,
  validate(updateSubscriptionSchema),
  adminController.updateSubscription,
);
adminRoute.patch(
  ADMIN_ROUTES.TOGGLE_SUBSCRIPTION_STATUS(":id"),  
  ROLE_GUARD.ADMIN_GUARD,
  adminController.toggleSubscriptionStatus,
);

export default adminRoute;