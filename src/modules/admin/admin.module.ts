import { AdminController } from "@/controllers/admin/admin.controller";
import { IAdminRepository } from "@/interfaces/admin/admin-repository.interface";
import { ISubscriptionRepository } from "@/interfaces/admin/subscription/subscription-repository.interface";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";
import AdminRepository from "@/repositories/admin/admin.repository";
import SubscriptionRepository from "@/repositories/admin/subscription.repository";
import { AdminService } from "@/services/admin/admin.services";
import { S3Service } from "@/services/s3/s3.service";

export function createAdminModule(){
    const adminRepository:IAdminRepository=new AdminRepository();
    const subscriptionRepository:ISubscriptionRepository = new SubscriptionRepository();
    const s3Service:IS3Service=new S3Service();
    const adminService=new AdminService(
        adminRepository,
        s3Service,
        subscriptionRepository

    );

    const adminController = new AdminController(adminService)

    return {adminController}
}