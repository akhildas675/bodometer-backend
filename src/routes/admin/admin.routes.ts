import { Router } from "express";
import { ADMIN_ROUTES } from "@/constants/routes.constant/admin-routes.constant";
import { ROLE_GUARD } from "@/constants/role.guard";
import { validate } from "@/middleware/validate";
import { createAdminModule } from "@/modules/admin/admin.module";
import {
  addWorkoutSchema,
  getWorkoutsSchema,
  addSubscriptionSchema,
  updateSubscriptionSchema,
} from "@/validators/admin/admin-validator";
import { getTrainerAppointmentsSchema, getTrainersSchema, profileIdParamSchema, rejectTrainerSchema, trainerIdParamSchema } from "@/validators/admin/admin-trainer.validator";
import { getUsersSchema, userIdParamSchema } from "@/validators/admin/admin-user.validator";
import { mediaUpload } from "@/config/multer";

const adminRoute = Router();
const { adminController } = createAdminModule();

// Workout Management
adminRoute.post(
  ADMIN_ROUTES.ADD_WORKOUT,
  ROLE_GUARD.ADMIN_GUARD,
  mediaUpload.fields([
    { name: "workoutImage", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },  
  ]),
  validate(addWorkoutSchema),
  adminController.createWorkout,
);
adminRoute.get(
  ADMIN_ROUTES.GET_WORKOUTS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(getWorkoutsSchema),
  adminController.getWorkout,
);

adminRoute.patch(
  ADMIN_ROUTES.TOGGLE_WORKOUT_STATUS(":id"),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.toggleWorkoutStatus,
);
adminRoute.get(
  ADMIN_ROUTES.GET_WORKOUT_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getWorkoutById,
);

adminRoute.put(
  ADMIN_ROUTES.UPDATE_WORKOUT(":id"),
  ROLE_GUARD.ADMIN_GUARD,
  mediaUpload.fields([
    { name: "workoutImage", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },
  ]),
  adminController.updateWorkout,
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



// Trainer Management
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINERS,
  ROLE_GUARD.ADMIN_GUARD, validate(getTrainersSchema),
  adminController.getTrainers,
);

adminRoute.patch(
  ADMIN_ROUTES.BLOCK_TRAINER,
  ROLE_GUARD.ADMIN_GUARD, validate(trainerIdParamSchema),
  adminController.blockTrainer,
);

adminRoute.patch(
  ADMIN_ROUTES.UNBLOCK_TRAINER,
  ROLE_GUARD.ADMIN_GUARD, validate(trainerIdParamSchema),
  adminController.unblockTrainer,
);


// Trainer Appointment Management
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINER_APPOINTMENTS,
  ROLE_GUARD.ADMIN_GUARD, validate(getTrainerAppointmentsSchema),
  adminController.getTrainerAppointments,
);

// Get Trainer by ProfileId
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINER_BY_ID,
  ROLE_GUARD.ADMIN_GUARD, validate(profileIdParamSchema),
  adminController.getTrainerById,
);

// Approve Trainer
adminRoute.patch(
  ADMIN_ROUTES.APPROVE_TRAINER,
  ROLE_GUARD.ADMIN_GUARD, validate(profileIdParamSchema),
  adminController.approveTrainer,
);

// Reject Trainer
adminRoute.patch(
  ADMIN_ROUTES.REJECT_TRAINER,
  ROLE_GUARD.ADMIN_GUARD, validate(rejectTrainerSchema),
  adminController.rejectTrainer,
);



// User Management
adminRoute.get(
  ADMIN_ROUTES.GET_USERS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(getUsersSchema),
  adminController.getUsers,
);

adminRoute.patch(
  ADMIN_ROUTES.BLOCK_USER,
  ROLE_GUARD.ADMIN_GUARD,
  validate(userIdParamSchema),
  adminController.blockUser,
);

adminRoute.patch(
  ADMIN_ROUTES.UNBLOCK_USER,
  ROLE_GUARD.ADMIN_GUARD,
  validate(userIdParamSchema),
  adminController.unblockUser,
);

adminRoute.get(
  ADMIN_ROUTES.GET_ONBOARDING_SECTIONS,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllSections,
);

export default adminRoute;