import { AdminTrainerController } from "../../controllers/admin/admin-trainer.controller";
import { IAdminTrainerRepository } from "../../interfaces/admin/admin.trainer-repository.interface";
import { IAdminTrainerService } from "../../interfaces/admin/admin.trainer-service.interface";
import AdminTrainerRepository from "../../repositories/admin/admin-trainer.repository";
import { AdminTrainerService } from "../../services/admin/admin-trainer.service";

export function createAdminTrainerModule(){
    const adminTrainerRepository:IAdminTrainerRepository = new AdminTrainerRepository();

    const adminTrainerService:IAdminTrainerService = new AdminTrainerService(adminTrainerRepository);

    const adminTrainerController = new AdminTrainerController(adminTrainerService)

    return {adminTrainerController}

}