import { Router } from "express";
import { authGuard } from "../../middleware/authGuard";
import { imageUpload } from "../../config/multer";
import { createAdminModule } from "../../modules/admin/admin.module";
import { ADMIN_ROUTES } from "../../constants/routes.constant/admin-routes.constant";

const adminRoute = Router();
const { adminController } = createAdminModule();

// User Management
adminRoute.get(
  ADMIN_ROUTES.GET_USERS,
  authGuard(["admin"]),
  adminController.getUsers,
);

adminRoute.patch(
  ADMIN_ROUTES.BLOCK_USER,
  authGuard(["admin"]),
  adminController.blockUser,
);

adminRoute.patch(
  ADMIN_ROUTES.UNBLOCK_USER,
  authGuard(["admin"]),
  adminController.unblockUser,
);

// Trainer Management
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINERS,
  authGuard(["admin"]),
  adminController.getTrainers,
);

adminRoute.patch(
  ADMIN_ROUTES.BLOCK_TRAINER,
  authGuard(["admin"]),
  adminController.blockTrainer,
);

adminRoute.patch(
  ADMIN_ROUTES.UNBLOCK_TRAINER,
  authGuard(["admin"]),
  adminController.unblockTrainer,
);

// Workout Management
adminRoute.post(
  ADMIN_ROUTES.ADD_WORKOUT,
  authGuard(["admin"]),
  imageUpload.single("workoutImage"),
  adminController.addWorkout,
);

adminRoute.get(
  ADMIN_ROUTES.GET_WORKOUTS,
  authGuard(["admin"]),
  adminController.getWorkout,
);

// Trainer Appointment Management
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINER_APPOINTMENTS,
  authGuard(["admin"]),
  adminController.getTrainerAppointments,
);

// Get Trainer by ProfileId
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINER_BY_ID,
  authGuard(["admin"]),
  adminController.getTrainerById,
);

// Approve Trainer
adminRoute.patch(
  ADMIN_ROUTES.APPROVE_TRAINER,
  authGuard(["admin"]),
  adminController.approveTrainer,
);

// Reject Trainer
adminRoute.patch(
  ADMIN_ROUTES.REJECT_TRAINER,
  authGuard(["admin"]),
  adminController.rejectTrainer,
);

export default adminRoute;