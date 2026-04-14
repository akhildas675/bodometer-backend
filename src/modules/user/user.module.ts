import { UserController } from "@/controllers/user/user.controller";
import { IStripeService } from "@/interfaces/payment/stripe-service.interface";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";
import { ISubscriptionRepository } from "@/interfaces/subscription/subscription-repository.interface";
import { ISubscriptionTransactionRepository } from "@/interfaces/subscription/subscription.transaction-repository.interface";
import { ITrainerProfileRepository } from "@/interfaces/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "@/interfaces/user/user-repository.interface";
import { IUserService } from "@/interfaces/user/user-service.interface";
import { IWorkoutRepository } from "@/interfaces/workout/workout-repository.interface";
import SubscriptionTransactionRepository from "@/repositories/subscription-transaction.repository";
import SubscriptionRepository from "@/repositories/subscription.repository";
import TrainerProfileRepository from "@/repositories/trainer-profile.repository";
import UserRepository from "@/repositories/user.repository";
import WorkoutRepository from "@/repositories/workout.repository";
import { StripeService } from "@/services/payments/stripe.service";
import { S3Service } from "@/services/s3/s3.service";
import { UserService } from "@/services/user/user.services";
import { IFitnessProfileRepository } from "@/interfaces/user/fitness-profile-repository.interface";
import { IWorkoutHistoryRepository } from "@/interfaces/user/workout-history-repository.interface";
import { IMedicalProfileRepository } from "@/interfaces/user/medical-profile-repository.interface";
import { IDailyHabitsRepository } from "@/interfaces/user/daily-habits-repository.interface";
import { FitnessProfileRepository } from "@/repositories/fitness-profile.repository";
import { WorkoutHistoryRepository } from "@/repositories/workout-history.repository";
import { MedicalProfileRepository } from "@/repositories/medical-profile.repository";
import { DailyHabitsRepository } from "@/repositories/daily-habits.repository";

export function createUserModule(){

    const userRepository:IUserRepository=new UserRepository();
    const s3Service:IS3Service=new S3Service();
    const workoutRepository:IWorkoutRepository = new WorkoutRepository()
    const trainerProfileRepository:ITrainerProfileRepository=new TrainerProfileRepository();

    const subscriptionRepository:ISubscriptionRepository = new SubscriptionRepository();

    const subscriptionTransactionRepository:ISubscriptionTransactionRepository = new SubscriptionTransactionRepository()

    const stripeService:IStripeService=new StripeService();

    const fitnessProfileRepository: IFitnessProfileRepository = new FitnessProfileRepository();
    const workoutHistoryRepository: IWorkoutHistoryRepository = new WorkoutHistoryRepository();
    const medicalProfileRepository: IMedicalProfileRepository = new MedicalProfileRepository();
    const dailyHabitsRepository: IDailyHabitsRepository = new DailyHabitsRepository();


    const userService:IUserService = new UserService(
        userRepository,
        s3Service,
        workoutRepository,
        trainerProfileRepository,
        subscriptionRepository,
        subscriptionTransactionRepository,
        stripeService,
        fitnessProfileRepository,
        workoutHistoryRepository,
        medicalProfileRepository,
        dailyHabitsRepository,

    );

    const userController = new UserController(userService);

    return {userController}
}