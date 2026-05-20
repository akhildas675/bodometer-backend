import { ICategoryRepository } from "@/interfaces/repository-interface/category/category-repository.interface";
import { AdminController } from "../../controllers/admin/admin.controller";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import TrainerProfileRepository from "../../repositories/trainer-profile.repository";
import UserRepository from "../../repositories/user.repository";
import { AdminService } from "../../services/admin/admin.services";
import { S3Service } from "../../services/s3/s3.service";
import CategoryRepository from "@/repositories/category.repository";
import { ISubscriptionFeatureRepository } from "@/interfaces/repository-interface/subscription/feature-repository.interface";
import SubscriptionFeatureRepository from "@/repositories/subscription-feature.repository";
import { ISubscriptionPlanRepository } from "@/interfaces/repository-interface/subscription/subscription-plan.repository";
import SubscriptionPlanRepository from "@/repositories/subscription-plan.repository";
import GroupRepository from "@/repositories/group.repository";
import QuestionRepository from "@/repositories/question.repository";
import { IGroupRepository } from "@/interfaces/repository-interface/onboarding/group-repository.interface";
import { IQuestionRepository } from "@/interfaces/repository-interface/onboarding/question-repository.interface";


export function createAdminModule() {

  const userRepository: IUserRepository = new UserRepository();
  const trainerProfileRepository: ITrainerProfileRepository = new TrainerProfileRepository();
  const categoryRepository: ICategoryRepository = new CategoryRepository();
  const subscriptionFeatureRepository: ISubscriptionFeatureRepository = new SubscriptionFeatureRepository();
  const subscriptionPlanRepository: ISubscriptionPlanRepository = new SubscriptionPlanRepository();
  const groupRepository: IGroupRepository = new GroupRepository();
  const questionRepository: IQuestionRepository = new QuestionRepository();

  const s3Service: IS3Service = new S3Service();
  const adminService = new AdminService(
    userRepository,
    trainerProfileRepository,
    s3Service,
    categoryRepository,
    subscriptionFeatureRepository,
    subscriptionPlanRepository,
    groupRepository,
    questionRepository,
  );

  const adminController = new AdminController(adminService)

  return { adminController }
}