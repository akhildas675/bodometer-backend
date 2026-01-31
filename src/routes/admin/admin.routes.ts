import { Router } from "express";
import { authGuard } from "../../middleware/authGuard";
import { imageUpload } from "../../config/multer";
import { createAdminModule } from "../../modules/admin/admin.module";

const adminRoute = Router();
const {adminController} = createAdminModule()

// User Management
adminRoute.get(
  "/admin/get-users",
  authGuard(["admin"]),
  adminController.getUsers,
);

adminRoute.patch(
  "/admin/users/:userId/block",
  authGuard(["admin"]),
  adminController.blockUser,
);

adminRoute.patch(
  "/admin/users/:userId/unblock",
  authGuard(["admin"]),
  adminController.unblockUser,
);

// Trainer Management (Block/Unblock)
adminRoute.get(
  "/admin/get-trainers",
  authGuard(["admin"]),
  adminController.getTrainers,
);

adminRoute.patch(
  "/admin/trainer/:trainerId/block",
  authGuard(["admin"]),
  adminController.blockTrainer,
);

adminRoute.patch(
  "/admin/trainer/:trainerId/unblock",
  authGuard(["admin"]),
  adminController.unblockTrainer,
);

// workout management
adminRoute.post(
  "/admin/add-workout",
  authGuard(["admin"]),
  imageUpload.single("workoutImage"),
  adminController.addWorkout,
);

adminRoute.get(
  "/admin/get-workouts",
  authGuard(["admin"]),
  adminController.getWorkout,
);

//trainer appointment management
adminRoute.post(
  "/admin/get-trainer-appointments",
  authGuard(["admin"]),
  adminController.getTrainerAppointments,
);

//get trainer by profileId
adminRoute.get(
  "/admin/trainers/profile/:profileId",
  authGuard(["admin"]),
  adminController.getTrainerById,
);

//Approve trainer
adminRoute.patch(
  "/admin/trainers/:profileId/approve",
  authGuard(["admin"]),
  adminController.approveTrainer,
);

//Reject trainer
adminRoute.patch(
  "/admin/trainers/:profileId/reject",
  authGuard(["admin"]),
  adminController.rejectTrainer,
);

export default adminRoute;
