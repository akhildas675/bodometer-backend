import { TrainerController } from "../../controllers/trainer/trainer.controller";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { ITrainerService } from "../../interfaces/service-interface/trainer/trainer-service.interface";
import TrainerProfileRepository from "@/repositories/trainer/trainer-profile.repository";
import UserRepository from "@/repositories/user/user.repository";
import { S3Service } from "../../services/s3/s3.service";
import { TrainerService } from "../../services/trainer/trainer.services";
import CategoryRepository from "@/repositories/category/category.repository";
import { ICategoryRepository } from "../../interfaces/repository-interface/category/category-repository.interface";

import { ITrainerBookingRepository } from "../../interfaces/repository-interface/trainer/trainer-booking.repository.interface";
import { TrainerBookingRepository } from "../../repositories/trainer/trainer-booking.repository";
import { ITrainerAvailabilityRepository } from "../../interfaces/repository-interface/trainer/trainer-availability.repository.interface";
import { TrainerAvailabilityRepository } from "../../repositories/trainer/trainer-availability.repository";
import { IUserSubscriptionRepository } from "../../interfaces/repository-interface/subscription/user.subscription.repository.interface";
import { UserSubscriptionRepository } from "../../repositories/subscription/user-subscription.repository";

export function createTrainerModule(){
    const userRepository = new UserRepository()
    const trainerProfileRepository:ITrainerProfileRepository= new TrainerProfileRepository();
    const s3Service:IS3Service = new S3Service()
    const categoryRepository: ICategoryRepository = new CategoryRepository();
    const trainerBookingRepo: ITrainerBookingRepository = new TrainerBookingRepository();
    const trainerAvailabilityRepo: ITrainerAvailabilityRepository = new TrainerAvailabilityRepository();
    const subscriptionRepo: IUserSubscriptionRepository = new UserSubscriptionRepository();

    const trainerService:ITrainerService = new TrainerService(
        userRepository,
        trainerProfileRepository,
        s3Service,
        categoryRepository,
        trainerBookingRepo,
        trainerAvailabilityRepo,
        subscriptionRepo,
    );




    const trainerController = new TrainerController(trainerService)

    return {trainerController}
}
