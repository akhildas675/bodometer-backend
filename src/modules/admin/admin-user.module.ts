import { AdminUserController } from "@/controllers/admin/admin-user.controller";
import { IAdminUserRepository } from "@/interfaces/admin/admin.user-repository.interface";
import { IAdminUserService } from "@/interfaces/admin/admin.user-service.interface";
import AdminUserRepository from "@/repositories/admin/admin-user.repository";
import { AdminUserService } from "@/services/admin/admin-user.service";

export function createAdminUserModule(){
    const adminUserRepository:IAdminUserRepository = new AdminUserRepository();

    const adminUserService:IAdminUserService  = new AdminUserService(adminUserRepository);

    const adminUserController = new AdminUserController(adminUserService);

    return {adminUserController}
}