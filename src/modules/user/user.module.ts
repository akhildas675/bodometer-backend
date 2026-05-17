import { UserController } from "../../controllers/user/user.controller";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IStripeService } from "../../interfaces/service-interface/payment/stripe-service.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { IUserService } from "../../interfaces/service-interface/user/user-service.interface";
import { ICategoryRepository } from "../../interfaces/repository-interface/category/category-repository.interface";
import TrainerProfileRepository from "../../repositories/trainer-profile.repository";
import UserRepository from "../../repositories/user.repository";
import CategoryRepository from "../../repositories/category.repository";
import { StripeService } from "../../services/payments/stripe.service";
import { S3Service } from "../../services/s3/s3.service";
import { UserService } from "../../services/user/user.services";

import SubscriptionPlanRepository from "../../repositories/subscription-plan.repository";
import { ISubscriptionPlanRepository } from "../../interfaces/repository-interface/subscription/subscription-plan.repository";

import { SubscriptionTransactionRepository } from "../../repositories/subscription-transaction.repository";
import { UserSubscriptionRepository } from "../../repositories/user-subscription.repository";
import { ISubscriptionTransactionRepository } from "../../interfaces/repository-interface/subscription/subscription.transaction-repository.interface";
import { IUserSubscriptionRepository } from "../../interfaces/repository-interface/subscription/user.subscription.repository.interface";

import { IGroupRepository } from "../../interfaces/repository-interface/onboarding/group-repository.interface";
import { IQuestionRepository } from "../../interfaces/repository-interface/onboarding/question-repository.interface";
import { IAnswerRepository } from "../../interfaces/repository-interface/onboarding/answer-repository.interface";
import GroupRepository from "../../repositories/group.repository";
import QuestionRepository from "../../repositories/question.repository";
import AnswerRepository from "../../repositories/answer.repository";

export function createUserModule(){

    const userRepository:IUserRepository=new UserRepository();
    const s3Service:IS3Service=new S3Service();
    const trainerProfileRepository:ITrainerProfileRepository=new TrainerProfileRepository();
    const categoryRepository:ICategoryRepository=new CategoryRepository();
    const subscriptionPlanRepository:ISubscriptionPlanRepository = new SubscriptionPlanRepository();
    const subscriptionTransactionRepository:ISubscriptionTransactionRepository = new SubscriptionTransactionRepository();
    const userSubscriptionRepository:IUserSubscriptionRepository = new UserSubscriptionRepository();
    const groupRepository: IGroupRepository = new GroupRepository();
    const questionRepository: IQuestionRepository = new QuestionRepository();
    const answerRepository: IAnswerRepository = new AnswerRepository();

    const stripeService:IStripeService=new StripeService();

    const userService:IUserService = new UserService(
        userRepository,
        s3Service,
        trainerProfileRepository,
        stripeService,
        categoryRepository,
        subscriptionPlanRepository,
        subscriptionTransactionRepository,
        userSubscriptionRepository,
        groupRepository,
        questionRepository,
        answerRepository
    );

    const userController = new UserController(userService);

    return {userController}
}
