import { UserController } from "../../controllers/user/user.controller";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { IUserService } from "../../interfaces/service-interface/user/user-service.interface";
import { ICategoryRepository } from "../../interfaces/repository-interface/category/category-repository.interface";
import TrainerProfileRepository from "@/repositories/trainer/trainer-profile.repository";
import UserRepository from "@/repositories/user/user.repository";
import CategoryRepository from "@/repositories/category/category.repository";
import { PaymentService } from "../../services/payments/stripe.service";
import { S3Service } from "../../services/s3/s3.service";
import { UserService } from "../../services/user/user.services";
import SubscriptionPlanRepository from "@/repositories/subscription/subscription-plan.repository";
import { ISubscriptionPlanRepository } from "../../interfaces/repository-interface/subscription/subscription-plan.repository";
import { SubscriptionTransactionRepository } from "@/repositories/subscription/subscription-transaction.repository";
import { UserSubscriptionRepository } from "@/repositories/subscription/user-subscription.repository";
import { ISubscriptionTransactionRepository } from "../../interfaces/repository-interface/subscription/subscription.transaction-repository.interface";
import { IUserSubscriptionRepository } from "../../interfaces/repository-interface/subscription/user.subscription.repository.interface";
import { IGroupRepository } from "../../interfaces/repository-interface/onboarding/group-repository.interface";
import { IQuestionRepository } from "../../interfaces/repository-interface/onboarding/question-repository.interface";
import { IAnswerRepository } from "../../interfaces/repository-interface/onboarding/answer-repository.interface";
import GroupRepository from "@/repositories/onboarding/group.repository";
import QuestionRepository from "@/repositories/onboarding/question.repository";
import AnswerRepository from "@/repositories/onboarding/answer.repository";
import { IPaymentService } from "@/interfaces/service-interface/payment/stripe-service.interface";
import { HealthMetricsService } from "../../services/health.metrics/health-metrics.service";
import ExerciseRepository from "@/repositories/exercise/exercise.repository";
import { IExerciseRepository } from "../../interfaces/repository-interface/exercise/exercise-repository.interface";
import EquipmentRepository from "@/repositories/equipment/equipment.repository";
import { IEquipmentRepository } from "../../interfaces/repository-interface/equipment/equipment-repository.interface";
import { IUserWorkoutPlanRepository } from "@/interfaces/repository-interface/workout/user-workout-plan.repository.interface";
import { UserWorkoutPlanRepository } from "@/repositories/workout/user-workout-plan.repository";
import { WorkoutPlanService } from "../../services/workout/workout-plan.service";


export function createUserModule() {
  const userRepository: IUserRepository = new UserRepository();
  const s3Service: IS3Service = new S3Service();
  const trainerProfileRepository: ITrainerProfileRepository = new TrainerProfileRepository();
  const categoryRepository: ICategoryRepository = new CategoryRepository();
  const subscriptionPlanRepository: ISubscriptionPlanRepository = new SubscriptionPlanRepository();
  const subscriptionTransactionRepository: ISubscriptionTransactionRepository = new SubscriptionTransactionRepository();
  const userSubscriptionRepository: IUserSubscriptionRepository = new UserSubscriptionRepository();
  const groupRepository: IGroupRepository = new GroupRepository();
  const questionRepository: IQuestionRepository = new QuestionRepository();
  const answerRepository: IAnswerRepository = new AnswerRepository();
  const healthMetricsService = new HealthMetricsService();
  const exerciseRepository: IExerciseRepository = new ExerciseRepository();
  const equipmentRepository: IEquipmentRepository = new EquipmentRepository();
  const userWorkoutPlanRepository: IUserWorkoutPlanRepository = new UserWorkoutPlanRepository();

  const paymentService: IPaymentService = new PaymentService();
  const workoutPlanService = new WorkoutPlanService(userWorkoutPlanRepository, exerciseRepository, answerRepository);

  const userService: IUserService = new UserService(
    userRepository,
    s3Service,
    trainerProfileRepository,
    paymentService,
    categoryRepository,
    subscriptionPlanRepository,
    subscriptionTransactionRepository,
    userSubscriptionRepository,
    groupRepository,
    questionRepository,
    answerRepository,
    healthMetricsService,
    exerciseRepository,
    equipmentRepository,
    workoutPlanService,
  );


  const userController = new UserController(userService);

  return { userController };
}
