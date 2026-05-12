import { TrainerController } from "../../controllers/trainer/trainer.controller";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { ITrainerService } from "../../interfaces/service-interface/trainer/trainer-service.interface";
import TrainerProfileRepository from "../../repositories/trainer-profile.repository";
import UserRepository from "../../repositories/user.repository";
import { S3Service } from "../../services/s3/s3.service";
import { TrainerService } from "../../services/trainer/trainer.services";
import CategoryRepository from "../../repositories/category.repository";
import { ICategoryRepository } from "../../interfaces/repository-interface/category/category-repository.interface";


export function createTrainerModule(){
    const userRepository = new UserRepository()
    const trainerProfileRepository:ITrainerProfileRepository= new TrainerProfileRepository();
    const s3Service:IS3Service = new S3Service()
    const categoryRepository: ICategoryRepository = new CategoryRepository();

    const trainerService:ITrainerService = new TrainerService(
        userRepository,
        trainerProfileRepository,
        s3Service,
        categoryRepository,
    );




    const trainerController = new TrainerController(trainerService)

    return {trainerController}
}
