import { Router } from "express";
import AdminRepository from "../../repositories/admin/admin.repository";
import { AdminService } from "../../services/admin/admin.services";
import { AdminController } from "../../controllers/admin/admin.controller";
import { authGuard } from "../../middleware/authGuard";
const adminRoute=Router()

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository)
const adminController = new AdminController(adminService);


adminRoute.get('/admin/get-users',authGuard(["admin"]),adminController.getUsers)

adminRoute.patch("/admin/users/:userId/block",authGuard(["admin"]),adminController.blockUser);

adminRoute.patch("/admin/users/:userId/unblock",authGuard(["admin"]),adminController.unblockUser);


export default adminRoute