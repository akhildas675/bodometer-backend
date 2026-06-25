import { ISubscriptionPlanRepository } from "@/modules/subscription/interface/repository.interface/subscription-plan.repository";
import { Container } from "inversify";
import { SUBSCRIPTION_TYPES } from "./subscription.types";
import SubscriptionPlanRepository from "./repositories/subscription-plan.repository";
import { ISubscriptionFeatureRepository } from "./interface/repository.interface/subscription.feature-repository.interface";
import SubscriptionFeatureRepository from "./repositories/subscription-feature.repository";
import { ISubscriptionTransactionRepository } from "./interface/repository.interface/subscription.transaction-repository.interface";
import { SubscriptionTransactionRepository } from "./repositories/subscription-transaction.repository";
import { IUserSubscriptionRepository } from "./interface/repository.interface/user.subscription.repository.interface";
import { UserSubscriptionRepository } from "./repositories/user-subscription.repository";
import { IAnswerRepository } from "@/modules/onboarding/interface/repository.interface/answer-repository.interface";
import AnswerRepository from "@/modules/onboarding/repositories/answer.repository";
import { IPaymentService } from "@/interfaces/service-interface/payment/stripe-service.interface";
import { PaymentService } from "@/services/payments/stripe.service";
import { IWorkoutPlanService } from "../workout-plan/interface/workout-plan-service.interface";
import { WorkoutPlanService } from "../workout-plan/service/workout-plan.service";
import { UserWorkoutPlanRepository } from "../workout-plan/repositories/user-workout-plan.repository";
import ExerciseRepository from "@/repositories/exercise/exercise.repository";
import { ISubscriptionService } from "./interface/subscription-interface.service";
import { SubscriptionService } from "./service/subscription.service";
import { SubscriptionController } from "./controller/subscription.controller";

export const loadSubscriptionBindings=(
    container:Container,
)=>{
    container.bind<ISubscriptionFeatureRepository>(SUBSCRIPTION_TYPES.SubscriptionFeatureRepository)
    .to(SubscriptionFeatureRepository)

    container.bind<ISubscriptionPlanRepository>(SUBSCRIPTION_TYPES.SubscriptionPlanRepository)
    .to(SubscriptionPlanRepository);

    container.bind<ISubscriptionTransactionRepository>(SUBSCRIPTION_TYPES.SubscriptionTransactionRepository)
    .to(SubscriptionTransactionRepository)

    container.bind<IUserSubscriptionRepository>(SUBSCRIPTION_TYPES.UserSubscriptionRepository)
    .to(UserSubscriptionRepository);

    container.bind<IPaymentService>(SUBSCRIPTION_TYPES.PaymentService)
    .to(PaymentService)

    const userWorkoutPlanRepository = new UserWorkoutPlanRepository();
    const exerciseRepository = new ExerciseRepository();
    const answerRepository = new AnswerRepository();
    const workoutPlanService = new WorkoutPlanService(userWorkoutPlanRepository, exerciseRepository, answerRepository, new UserSubscriptionRepository());

    container.bind<IWorkoutPlanService>(SUBSCRIPTION_TYPES.WorkoutPlanService)
    .toConstantValue(workoutPlanService);

    container.bind<ISubscriptionService>(SUBSCRIPTION_TYPES.Service)
    .to(SubscriptionService)


    container.bind<SubscriptionController>(SUBSCRIPTION_TYPES.SubscriptionController)
    .to(SubscriptionController)



}

