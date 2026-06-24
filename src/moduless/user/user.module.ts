import { UserController } from "../../controllers/user/user.controller";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { IUserService } from "../../interfaces/service-interface/user/user-service.interface";
import { ICategoryRepository } from "../../modules/category/interface/category-repository.interface";
import TrainerProfileRepository from "@/repositories/trainer/trainer-profile.repository";
import UserRepository from "@/repositories/user/user.repository";
import CategoryRepository from "@/modules/category/repositories/category.repository";
import { PaymentService } from "../../services/payments/stripe.service";
import { S3Service } from "../../services/s3/s3.service";
import { UserService } from "../../services/user/user.services";
import SubscriptionPlanRepository from "@/modules/subscription/repositories/subscription-plan.repository";
import { ISubscriptionPlanRepository } from "../../modules/subscription/interface/repository.interface/subscription-plan.repository";
import MealCategoryRepository from "@/repositories/meal-category/meal-category.repository";
import { IMealCategoryRepository } from "@/interfaces/repository-interface/meal.category/meal-category.repository";
import { SubscriptionTransactionRepository } from "@/modules/subscription/repositories/subscription-transaction.repository";
import { UserSubscriptionRepository } from "@/modules/subscription/repositories/user-subscription.repository";
import { IUserSubscriptionRepository } from "../../modules/subscription/interface/repository.interface/user.subscription.repository.interface";
import { IPaymentService } from "@/interfaces/service-interface/payment/stripe-service.interface";
import { HealthMetricsService } from "../../services/health.metrics/health-metrics.service";
import ExerciseRepository from "@/repositories/exercise/exercise.repository";
import { IExerciseRepository } from "../../interfaces/repository-interface/exercise/exercise-repository.interface";
import EquipmentRepository from "@/repositories/equipment/equipment.repository";
import { IEquipmentRepository } from "../../interfaces/repository-interface/equipment/equipment-repository.interface";
import { IUserWorkoutPlanRepository } from "@/interfaces/repository-interface/workout/user-workout-plan.repository.interface";
import { UserWorkoutPlanRepository } from "@/repositories/workout/user-workout-plan.repository";
import { WorkoutPlanService } from "../../services/workout/workout-plan.service";
import { IHealthLogRepository } from "../../interfaces/repository-interface/health-log/health-log-repository.interface";
import { HealthLogRepository } from "../../repositories/health-log/health-log.repository";
import { AiHealthService } from "../../services/ai-services/ai-health.service";
import { HealthLogService } from "../../services/health-log/health-log.service";
import { IHealthLogService } from "../../interfaces/service-interface/health-log/health-log-service.interface";
import { ITrainerBookingRepository } from "../../interfaces/repository-interface/trainer/trainer-booking.repository.interface";
import { TrainerBookingRepository } from "../../repositories/trainer/trainer-booking.repository";
import { ITrainerAvailabilityRepository } from "../../interfaces/repository-interface/trainer/trainer-availability.repository.interface";
import { TrainerAvailabilityRepository } from "../../repositories/trainer/trainer-availability.repository";
import { ISubscriptionTransactionRepository } from "../../modules/subscription/interface/repository.interface/subscription.transaction-repository.interface";
import AnswerRepository from "@/modules/onboarding/repositories/answer.repository"; // Keep AnswerRepository for WorkoutPlanService constructor

export function createUserModule() {
  const userRepository: IUserRepository = new UserRepository();
  const s3Service: IS3Service = new S3Service();
  const trainerProfileRepository: ITrainerProfileRepository = new TrainerProfileRepository();
  const categoryRepository: ICategoryRepository = new CategoryRepository();
  const subscriptionPlanRepository: ISubscriptionPlanRepository = new SubscriptionPlanRepository();
  const subscriptionTransactionRepository: ISubscriptionTransactionRepository = new SubscriptionTransactionRepository();
  const userSubscriptionRepository: IUserSubscriptionRepository = new UserSubscriptionRepository();
  const healthMetricsService = new HealthMetricsService();
  const exerciseRepository: IExerciseRepository = new ExerciseRepository();
  const equipmentRepository: IEquipmentRepository = new EquipmentRepository();
  const mealCategoryRepository: IMealCategoryRepository = new MealCategoryRepository();
  const userWorkoutPlanRepository: IUserWorkoutPlanRepository = new UserWorkoutPlanRepository();
  const healthLogRepository: IHealthLogRepository = new HealthLogRepository();
  const trainerBookingRepository: ITrainerBookingRepository = new TrainerBookingRepository();
  const trainerAvailabilityRepository: ITrainerAvailabilityRepository = new TrainerAvailabilityRepository();
  const paymentService: IPaymentService = new PaymentService();
  
 
  const answerRepository = new AnswerRepository();
  const workoutPlanService = new WorkoutPlanService(userWorkoutPlanRepository, exerciseRepository, answerRepository);
  
  const aiHealthService = new AiHealthService();
  const healthLogService: IHealthLogService = new HealthLogService(
    healthLogRepository,
    aiHealthService,
    userSubscriptionRepository
  );

  const userService: IUserService = new UserService(
    userRepository,
    s3Service,
    trainerProfileRepository,
    paymentService,
    categoryRepository,
    subscriptionPlanRepository,
    subscriptionTransactionRepository,
    userSubscriptionRepository,
    healthMetricsService,
    exerciseRepository,
    equipmentRepository,
    trainerBookingRepository,
    trainerAvailabilityRepository,
    mealCategoryRepository,
    workoutPlanService,
  );


  const userController = new UserController(userService, healthLogService);

  return { userController };
}
