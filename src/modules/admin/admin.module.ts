import { AdminController } from "@/controllers/admin/admin.controller";
import { IAdminRepository } from "@/interfaces/admin/admin-repository.interface";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";
import AdminRepository from "@/repositories/admin/admin.repository";
import { AdminService } from "@/services/admin/admin.services";
import { S3Service } from "@/services/s3/s3.service";

export function createAdminModule(){
    const adminRepository:IAdminRepository=new AdminRepository();
    const s3Service:IS3Service=new S3Service();
    const adminService=new AdminService(
        adminRepository,
        s3Service
    );

    const adminController = new AdminController(adminService)

    return {adminController}
}