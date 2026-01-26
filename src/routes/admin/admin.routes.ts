import { Router } from "express";
import AdminRepository from "../../repositories/admin/admin.repository";
import { AdminService } from "../../services/admin/admin.services";
import { AdminController } from "../../controllers/admin/admin.controller";
import { S3Service } from "../../services/s3/s3.service";
import { authGuard } from "../../middleware/authGuard";
import { imageUpload } from "../../config/multer";


const adminRoute = Router();
const adminRepository = new AdminRepository();
const s3Service = new S3Service()
const adminService = new AdminService(adminRepository,s3Service);
const adminController = new AdminController(adminService);



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
adminRoute.post(
  "/admin/add-workout",
  authGuard(["admin"]),
  imageUpload.single("workoutImage"),adminController.addWorkout
);
adminRoute.get(
  "/admin/get-workouts",
  authGuard(["admin"]),adminController.getWorkout
)

export default adminRoute;
