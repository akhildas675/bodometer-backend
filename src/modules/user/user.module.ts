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

export function createUserModule(){

    const userRepository:IUserRepository=new UserRepository();
    const s3Service:IS3Service=new S3Service();
    const trainerProfileRepository:ITrainerProfileRepository=new TrainerProfileRepository();
    const categoryRepository:ICategoryRepository=new CategoryRepository();

    const stripeService:IStripeService=new StripeService();

    const userService:IUserService = new UserService(
        userRepository,
        s3Service,
        trainerProfileRepository,
        stripeService,
        categoryRepository,
    );

    const userController = new UserController(userService);

    return {userController}
}
