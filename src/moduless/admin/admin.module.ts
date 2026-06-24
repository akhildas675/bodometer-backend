
import { AdminController } from "../../controllers/admin/admin.controller";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import TrainerProfileRepository from "@/repositories/trainer/trainer-profile.repository";
import UserRepository from "@/repositories/user/user.repository";
import { AdminService } from "../../services/admin/admin.services";
import { S3Service } from "../../services/s3/s3.service";

import { ISubscriptionPlanRepository } from "@/modules/subscription/interface/repository.interface/subscription-plan.repository";
import SubscriptionPlanRepository from "@/modules/subscription/repositories/subscription-plan.repository";

import MealCategoryRepository from "@/repositories/meal-category/meal-category.repository";
import { IMealCategoryRepository } from "@/interfaces/repository-interface/meal.category/meal-category.repository";


export function createAdminModule() {

  const userRepository: IUserRepository = new UserRepository();
  const trainerProfileRepository: ITrainerProfileRepository = new TrainerProfileRepository();

  const subscriptionPlanRepository: ISubscriptionPlanRepository = new SubscriptionPlanRepository();

  const mealCategoryRepository: IMealCategoryRepository = new MealCategoryRepository();

  const s3Service: IS3Service = new S3Service();
  const adminService = new AdminService(
    userRepository,
    trainerProfileRepository,
    s3Service,
    subscriptionPlanRepository,
    mealCategoryRepository
  );

  const adminController = new AdminController(adminService)

  return { adminController }
}