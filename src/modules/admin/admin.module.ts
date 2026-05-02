import { AdminController } from "../../controllers/admin/admin.controller";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import TrainerProfileRepository from "../../repositories/trainer-profile.repository";
import UserRepository from "../../repositories/user.repository";
import { AdminService } from "../../services/admin/admin.services";
import { S3Service } from "../../services/s3/s3.service";

export function createAdminModule() {

  const userRepository: IUserRepository = new UserRepository();
  const trainerProfileRepository: ITrainerProfileRepository = new TrainerProfileRepository();

  const s3Service: IS3Service = new S3Service();
  const adminService = new AdminService(
    userRepository,
    trainerProfileRepository,
    s3Service,
  );

  const adminController = new AdminController(adminService)

  return { adminController }
}